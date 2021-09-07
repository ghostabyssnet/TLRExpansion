import { std } from "tswow-stdlib";
import { Ids } from "tswow-stdlib/Misc/Ids";
import { DBC, SQL } from "wotlkdata";
import { SQL_trinity_string } from "wotlkdata/sql/types/trinity_string";
import { ArgsSqlStr, Q_exists, Q_exists_string, SqlStr, stringToSql } from "../Database/DatabaseFunctions";
import { CHARDB, db_gameobject_template } from "../Database/DatabaseSetup";

/*
 * -------------------------------------
 * GAMEOBJECT DATABASE FUNCTIONS
 * General GameObject database solutions
 * -------------------------------------
*/

// turn this on for verbose
const DEBUG = true;

// constant used for internal ID stuff for gameobject mirrors. change only if you know what you're doing
const INTERNAL_HOUSING_TAG = 'HSOBJMIR'

export let human_objects: any[] = [];

const table_t = {
    model: "World\\Generic\\Human\\Passive Doodads\\Tables\\inntable.m2",
    icon: "Interface\\Icons\\Spell_Shadow_Brainwash.blp",
    id: "hstablehuman",
    name: "Table",
    type_t: 5
}
human_objects.push(table_t);

const bottle_green_t = {
    model: "World\\Generic\\Human\\Passive Doodads\\Bottles\\GreenBottle02.mdx",
    icon: "Interface\\Icons\\Spell_Shadow_Brainwash.blp",
    id: "hs-bottle-green",
    name: "Green Bottle",
    type_t: 5
}

// use this as an example for what a gameobject needs to be created 
const example_gameobject_info = {
    model: "World\\Generic\\Human\\Passive Doodads\\Bottles\\GreenBottle02.mdx",
    icon: "Interface\\Icons\\Spell_Shadow_Brainwash.blp",
    id: "hs-bottle-green",
    name: "Green Bottle",
    type_t: 5
}

const bottle_green_t2 = {
    model: "World\\Generic\\Human\\Passive Doodads\\Bottles\\GreenBottle02.mdx",
    icon: "Interface\\Icons\\Spell_Shadow_Brainwash.blp",
    id: "hs-bottle-green",
    name: "Green Bottle",
    type_t: 5
}

const bottle_green_t3 = {
    model: stringToSql(bottle_green_t.model),
    icon: stringToSql(bottle_green_t.icon),
    id: stringToSql(bottle_green_t.id),
    name: stringToSql(bottle_green_t.name),
    type_t: bottle_green_t.type_t
}

/* ------------------------------
 * Database Variables and Queries
 * ------------------------------
*/

// TODO: #8 don't forget the whole importing templates from json thing

/**
 * Returns if a GameObject Template exists
 * @param id A TSWoW (TLRSomething...) id, no prefix
 * @returns boolean
 */
export function GameObjectTemplateExists(id: string) : boolean {
    return Q_exists_string(stringToSql(id), db_gameobject_template);
}

function ValidateQuality(s: string) : number {
    switch (s) {
        case 'gray':
        case 'trash':
            return 0;
        case 'white':
        case 'common':
            return 1;
        case 'green':
        case 'uncommon':
            return 2;
        case 'blue':
        case 'rare':
            return 3;
        case 'purple':
        case 'epic':
            return 4;
        case 'orange':
        case 'legendary':
            return 5;
        case 'heirloom':
            return 6;
    }
    return -1;
}

/**
 * Creates a new GameObject Base Template and adds it to our database
 * ATTENTION: If you're looking to simply create a new housing object,
 * THIS IS NOT THE FUNCTION TO USE. Use HousingObjectCreate() instead!!!
 * @param model path to our model (raw, don't use toSql)
 * @param icon path to our icon (raw, don't use toSql)
 * @param id a unique id for TSWoW itself, doesn't need to be a number
 * @param name our object's name in-game, doesn't need to be unique
 * @param type our GameObjectType. read the wiki! it's almost always 5
 */
function GameObjectTemplateCreate(model: string, icon: string, id: string, name: string, rarity: number, type_t: number = 5) : number {
    // careful: this will always create a new gameobject in the game database, even if everything else fails
    if (id.includes(INTERNAL_HOUSING_TAG)) return -99;
    if (GameObjectTemplateExists(id)) return -2; // no duplicate entries
    let args = [];
    for (let x = 0; x < arguments.length; x++) {
        args[x] = stringToSql(arguments[x].toString());
    }
    args = ArgsSqlStr(args);
    // creates a new gameobject display info
    let dinfo = DBC.GameObjectDisplayInfo.add(Ids.GameObjectDisplay.id())
    .ModelName.set(model);
    let displayid = dinfo.ID.get(); // our wow database (dbc) displayid
    if (Q_exists(displayid, db_gameobject_template, 'displayid')) return -4; // no duplicate entries
    // creates a unique id for tswow for this gameobject
    let tswowid: number = Ids.GameObjectTemplate.id("TLRHousing", id); // read below
    // tswow creates an ID for this by itself, we will end up with 3 ids: internalid for SQL, id (TLRHousing-...) for tswow, ID for the actual game
    if (!tswowid) {
        console.log("TSWoW couldn't generate an TSWOWID for " + dinfo + '(' + name + ')'); // something went terribly wrong
        return -3;
    }
    let template = SQL.gameobject_template
        .add(Ids.GameObjectTemplate.id("TLRHousing",id))
        .displayId.set(dinfo.ID.get())
        .type.set(type_t)
        .size.set(1)
        .Data0.set(0)
        .Data1.set(0)
        .name.set(name);
    let entry = template.entry.get(); // our wow database (dbc) unique entry

    let query: string = 'INSERT INTO ' + db_gameobject_template + '(entry, id, displayid, icon, name, rarity, type) VALUES (' + entry + ',' + args[2] + ',' + displayid + ',' + args[1] + ',' + args[3] + ',' + rarity + ',' + type_t + ');';
    if (DEBUG) console.log(query);
    CHARDB.read(query);
    console.log('Template ' + entry + ' created successfully!');
    return entry;
    /*
    what the fuck? TODO: #12 remove this I guess (if we don't need mirrors)
    let getid: string = 'SELECT internalid FROM ' + db_gameobject_template + ' WHERE entry = ' + entry + ';';
    let lambimia: object[] = CHARDB.read(getid);
    lambimia = lambimia as [];
    if (undefined !== lambimia && lambimia.length){
        let internalid: number = -98;
        if ((lambimia as unknown as object[]).length) {
            lambimia = lambimia as any;
            if (lambimia.length >= 1) internalid = Object.values((lambimia[0] as object)) as unknown as number; else internalid = -99;
        }
        if (internalid == -98) {
            console.log('ID bug didnt change internalid');
            return -5;
        }
        else if (internalid == -99) {
            console.log('ID BUG didnt find shit');
            return -6;
        }
        let mirrorid: string = SqlStr(id + INTERNAL_HOUSING_TAG);
        query = 'INSERT INTO ' + db_gameobject_mirror + '(internalid, entry, id, name, type) VALUES (' + internalid + ',' + entry + ',' + mirrorid + ',' + args[3] + ',' + type_t + ');';
        if (DEBUG) console.log(query);
        CHARDB.read(query);
        console.log('TemplateMirror ' + entry + ' created successfully!');
    }
    else {
        console.log(lambimia);
    }
    return entry;*/
}

/**
 * Deletes a GameObjectTemplate and related data
 * @param id a tswowid (without TLRHousing- or any prefix)
 * @returns BIG TODO:
 */
export function GameObjectBaseDelete(deprecated: string, fixthis: string) : boolean {
    // BIG TODO:
    // model = stringToSql(model);
    //if (!HousingBaseExists(model)) return false;
    let query: string = 'DELETE FROM '// + db_gameobject_base + ' WHERE model = ' + SqlStr(model) + ';';
    CHARDB.write(query);
    return true;
}

export function GameObjectInstanceCreate() {

}

export function GameObjectInstanceRemove() {

}

// TODO: test this (housingitemquality), then set it to export maybe

/**
 * returns the quality of a housing item stored in the database
 * @param id the item's tswowid (as stored in database, no prefixes)
 * @returns quality as a numerical id OR errors: -1 for not found or -2 for duplicate or -3 for invalid
 */
function HousingItemQuality(id: string) : number {
    let query: string = 'SELECT quality FROM ' + db_gameobject_template + ' WHERE id = ' + SqlStr(id) + ';';
    let result = CHARDB.read(query);
    if (result.length < 1) return -1; // error code for no quality found
    else if (result.length >= 2) return -2; // error code for duplicate item found
    else {
        result = result[0].entry as string;
        switch (result) {
            case 'gray':
                return 0;
            case 'white':
                return 1;
            case 'green':
                return 2;
            case 'blue':
                return 3;
            case 'purple':
                return 4;
            case 'orange':
                return 5;
            case 'heirloom':
                return 6;
        }
    }
    return -3; // errorcode for invalid quality
}

/**
 * Creates a new housing spell. avoid calling this by yourself,
 * use HousingObjectCreate() instead
 * @param id TSWoW ID
 * @param name Spell name
 * @param icon Path to icon file
 * @param entry GameObjectTemplate entry id
 * @returns error or not
 */
function HousingSpellCreate(id: string, name: string, icon: string, entry: number) : number {
    if (!GameObjectTemplateExists(id)){
        console.log("HousingSpellCreate() ERROR: Template " + id + " doesn't exist!"); 
        return -2;
    }
    let spl = std.Spells.create("TLRHousing", id, 61031);
        spl.Name.enGB.set(name);
        spl.Description.enGB.set('Used in a house or garrison.');
        spl.CastTime.set(0,0,0);
        spl.Duration.set(1000, 0, 1000);
        spl.Icon.set(icon);
        // set the gameobject to add as a hover information
        // it does get spawned for 1 tick but players shouldn't be able to notice it
        spl.Effects.get(0).EffectType.setTransDoor().GameObjectTemplate.set(entry);
        spl.Range.set(0, 10, 0, 10);
    return spl.ID;
}

/**
 * Creates a new housing item. avoid calling this by yourself,
 * use HousingObjectCreate() instead
 * @param id TSWoW ID
 * @param name Spell name
 * @param icon Path to icon file
 * @param quality Item quality as number (see quality IDs)
 * @param spellid Spell ID of what summons the object
 * @returns error or not
 */
function HousingItemCreate(id: string, name: string, icon: string, quality: number, entry: number) : number {
    if (!GameObjectTemplateExists(id)){
        console.log("HousingItemCreate() ERROR: Template " + id + " doesn't exist!"); 
        return -2;
    }
    let item = std.Items.create("TLRHousing", id, 44606)
            .Name.enGB.set(name)
            .Quality.set(quality)
            .Bonding.setNoBounds()
            .Description.enGB.set("Used in houses.")
            .DisplayInfo.Icon.set(icon).end
            .Spells.clearAll()
            .Spells.add(entry).end
    return item.ID;
}

/**
 * 
 * @param model 
 * @param icon 
 * @param id 
 * @param name 
 * @param quality
 * @param type_t 
 */
export function HousingObjectCreate(model: string, icon: string, id: string, name: string, quality: string, type_t: number = 5) {
    // TODO: test this thoroughly
    let templateid: number = -1; // -1 as error
    let spellid: number = -1;
    let itemid: number = -1;
    let qual = ValidateQuality(quality);
    if (qual < 0 || qual > 6) {
        console.log("Failed to create GameObjectTemplate " + id + "! Invalid item quality: " + quality);
        return;
    }
    templateid = GameObjectTemplateCreate(model, icon, id, name, qual, type_t);
    if (templateid <= 0) {
        switch (templateid) {
            case 0:
            case -1:
                console.log("Failed to create GameObjectTemplate " + id + "! Internal error. Report this!");
                return;
            case -2:
                return;
            case -3:
                console.log("Failed to create GameObjectTemplate " + id +"! TSWoW couldn't generate an ID for itself. Report this!");
                return;
            case -4:
                console.log("Failed to create GameObjectTemplate " + id +"! GameObjectTemplate with this Display ID already exists.");
                return;
            default:
                console.log("Unknown error creating GameObjectTemplate " + id +". Please report this ASAP.");
                return;
        }
    }
    if (DEBUG) console.log("GameObjectTemplate created with ID " + templateid + "!");
    spellid = HousingSpellCreate(id, name, icon, templateid);
    if (spellid <= 0) {
        switch (spellid) {
            case 0:
            case -1:
                console.log("Failed to create HousingSpell " + id + "! Internal error. Report this!");
                return;
            case -2:
                return;
            default:
                console.log("Unknown error creating HousingSpell " + id +". Please report this ASAP.");
                return;
        }
    }
    if (DEBUG) console.log("HousingSpell created with ID " + spellid + "!");
    itemid = HousingItemCreate(id, name, icon, qual, spellid);
    if (itemid <= 0) {
        switch (itemid) {
            case 0:
            case -1:
                console.log("Failed to create HousingItem " + id + "! Internal error. Report this!");
                return;
            case -2:
                console.log("Failed to create HousingItem " + id +"! Template with this ID already exists.");
                return;
            default:
                console.log("Unknown error creating HousingItem " + id +". Please report this ASAP.");
                return;
        }
    }
    if (DEBUG) console.log("HousingItem created with ID " + itemid + "!");
}
//console.log(CHARDB.read('SHOW VARIABLES LIKE \'sql_mode\''));
HousingObjectCreate(table_t.model, table_t.icon, table_t.id, table_t.name, 'blue', table_t.type_t);
//console.log((Q_exists(10000, db_gameobject_template, 'displayid')));
/* ---------
 * Functions
 * ---------
*/

/*CHARDB.write('DELETE FROM gm_go_base;');
CHARDB.write('DELETE FROM gm_go_template;');
CHARDB.write('DELETE FROM gm_go_mirror;');*/

/*function SqlTest() {
    let query = 'SELECT * FROM gm_go_base;';
    //let query = 'SELECT * FROM gm_go_base WHERE model = ' + '\'' + bottle_green_t2.model + '\'' + ";"
    let stuff = (CHARDB.read(query));
    //let stuff = (CHARDB.read('SELECT model FROM gm_go_base WHERE model=' + '\'' + bottle_green_t.model + '\'' + ';'));
    if (DEBUG) console.log(stuff.length);
    //if (stuff.length >= 1) console.log(stuff[0].model);
    //console.log(stuff[0].model);
    //if (DEBUG) console.log(JSON.stringify(stuff));
    //if (stuff.length >= 1) console.log(stringFromSql(stuff[0].model));
}*/
