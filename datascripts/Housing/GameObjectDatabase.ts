import { std } from "tswow-stdlib";
import { Ids } from "tswow-stdlib/Misc/Ids";
import { DBC, SQL } from "wotlkdata";
import { SQL_trinity_string } from "wotlkdata/sql/types/trinity_string";
import { ArgsSqlStr, Q_exists_string, SqlStr, stringToSql } from "../Database/DatabaseFunctions";
import { CHARDB, db_gameobject_template } from "../Database/DatabaseSetup";

/*
 * -------------------------------------
 * GAMEOBJECT DATABASE FUNCTIONS
 * General GameObject database solutions
 * -------------------------------------
*/

// turn this on for verbose
const DEBUG = true;

export let human_objects: any[] = [];

const table_t = {
    model: "World\\Generic\\Human\\Passive Doodads\\Tables\\inntable.m2",
    icon: "Interface\\Icons\\Spell_Shadow_Brainwash.blp",
    id: "hs-table-human",
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
 * @param id A TSWoW (TLRSomething-...) id, including prefix 
 * @returns boolean
 */
export function GameObjectTemplateExists(id: string) : boolean {
    return Q_exists_string(stringToSql(id), db_gameobject_template);
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
function GameObjectTemplateCreate(model: string, icon: string, id: string, name: string, type_t: number = 5) : boolean {
    // careful: this will always create a new gameobject in the game database, even if everything else fails

    if (GameObjectTemplateExists(id)) return false; // no duplicate entries

    let args = [];
    for (let x = 0; x < arguments.length; x++) {
        args[x] = stringToSql(arguments[x].toString());
    }
    args = ArgsSqlStr(args);
    // creates a new gameobject display info
    let dinfo = DBC.GameObjectDisplayInfo.add(Ids.GameObjectDisplay.id())
    .ModelName.set(model);
    let displayid = dinfo.ID.get(); // our wow database (dbc) displayid

    // creates a unique id for tswow for this gameobject
    let tswowid: number = Ids.GameObjectTemplate.id("TLRHousing-", id); // read below
    // tswow creates an ID for this by itself, we will end up with 3 ids: internalid for SQL, id (TLRHousing-...) for tswow, ID for the actual game
    if (!tswowid) console.log("TSWoW couldn't generate an TSWOWID for " + dinfo + '(' + name + ')'); // something went terribly wrong
    
    let template = SQL.gameobject_template
        .add(Ids.GameObjectTemplate.id("TLRHousing-",id))
        .displayId.set(dinfo.ID.get())
        .type.set(type_t)
        .size.set(1)
        .Data0.set(0)
        .Data1.set(0)
        .name.set(name);
    let entry = template.entry.get(); // our wow database (dbc) unique entry

    let query: string = 'INSERT INTO ' + db_gameobject_template + '(entry, id, displayid, icon, name, type) VALUES (' + entry + ',' + args[2] + ',' + displayid + ',' + args[1] + ',' + args[3] + ',' + type_t + ');';
    if (DEBUG) console.log(query);
    CHARDB.write(query);
    console.log('Template ' + entry + ' created successfully!');
    return true;
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

// TODO: test this (housingitemquality)

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
function HousingSpellCreate(id: string, name: string, icon: string, entry: number) : boolean {
    if (!GameObjectTemplateExists(id)){
        console.log("HousingSpellCreate() ERROR: Template " + id + " doesn't exist!"); 
        return false;
    }
    let spl = std.Spells.create("TLRHousing-", id, 61031);
        spl.Name.enGB.set(name);
        spl.Description.enGB.set('Used in a house or garrison.');
        spl.CastTime.set(0,0,0);
        spl.Duration.set(1000, 0, 1000);
        spl.Icon.set(icon);
        // set the gameobject to add as a hover information
        // it does get spawned for 1 tick but players shouldn't be able to notice it
        spl.Effects.get(0).EffectType.setTransDoor().GameObjectTemplate.set(entry);
        spl.Range.set(0, 10, 0, 10);
    return true;
}

/**
 * Creates a new housing item. avoid calling this by yourself,
 * use HousingObjectCreate() instead
 * @param id TSWoW ID
 * @param name Spell name
 * @param icon Path to icon file
 * @param entry Spell id
 * @returns error or not
 */
function HousingItemCreate(id: string, name: string, icon: string, entry: number) : boolean{
    if (!GameObjectTemplateExists(id)){
        console.log("HousingSpellCreate() ERROR: Template " + id + " doesn't exist!"); 
        return false;
    }
    let item = std.Items.create("TLRHousing-", id, 44606)
            .Name.enGB.set(name)
            .Quality.set(9999999) // TODO: !!!
            .Bonding.setNoBounds()
            .Description.enGB.set("Used in houses.")
            .DisplayInfo.Icon.set(icon).end
            .Spells.clearAll()
            .Spells.add(entry).end
    return true;
}

/**
 * 
 * @param model 
 * @param icon 
 * @param id 
 * @param name 
 * @param type_t 
 */
export function HousingObjectCreate(model: string, icon: string, id: string, name: string, type_t: number = 5) {
    // TODO: this
}

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
