import { std } from "tswow-stdlib";
import { Ids } from "tswow-stdlib/Misc/Ids";
import { DBC, SQL } from "wotlkdata";
import { ArgsSqlStr, Q_exists, Q_exists_string, SqlStr, stringToSql } from "../Database/DatabaseFunctions";
import { CHARDB, db_gameobject_template } from "../Database/DatabaseSetup";
import fs from 'fs';

/*
 * -------------------------------------
 * GAMEOBJECT DATABASE FUNCTIONS
 * General GameObject database solutions
 * -------------------------------------
*/

// TODO: #16 generate types and classes and stuff for this file

// turn this on for verbose
const DEBUG = true;

// file path for housing objects' definitions (json file)
const HS_PATH = './modules/TLRExpansion/datascripts/Housing/housingobjects.json';

// constant used for internal ID stuff for gameobject mirrors. change only if you know what you're doing
const INTERNAL_HOUSING_TAG = 'HSOBJMIR';

// load base housing objects from JSON and create them
// TODO: uncomment below
//CreateHousingObjectsFromFile();

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
    return Q_exists_string('id', db_gameobject_template, stringToSql(id));
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
        if (DEBUG) console.log("Failed to create GameObjectTemplate " + id + "! Invalid item quality: " + quality);
        return;
    }
    templateid = GameObjectTemplateCreate(model, icon, id, name, qual, type_t);
    if (templateid <= 0) {
        switch (templateid) {
            case 0:
            case -1:
                if (DEBUG) console.log("Failed to create GameObjectTemplate " + id + "! Internal error. Report this!");
                return;
            case -3:
                if (DEBUG) console.log("Failed to create GameObjectTemplate " + id + "! TSWoW couldn't generate an ID for itself. Report this!");
                return;
            case -2:
            case -4:
                if (DEBUG) console.log("Failed to create GameObjectTemplate " + id + "! GameObjectTemplate with this Display ID already exists.");
                return;
            default:
                if (DEBUG) console.log("Unknown error creating GameObjectTemplate " + id + ". Please report this ASAP.");
                return;
        }
    }
    if (DEBUG) console.log("GameObjectTemplate created with ID " + templateid + "!");
    spellid = HousingSpellCreate(id, name, icon, templateid);
    if (spellid <= 0) {
        switch (spellid) {
            case 0:
            case -1:
                if (DEBUG) console.log("Failed to create HousingSpell " + id + "! Internal error. Report this!");
                return;
            case -2:
                return;
            default:
                if (DEBUG) console.log("Unknown error creating HousingSpell " + id + ". Please report this ASAP.");
                return;
        }
    }
    if (DEBUG) console.log("HousingSpell created with ID " + spellid + "!");
    itemid = HousingItemCreate(id, name, icon, qual, spellid);
    if (itemid <= 0) {
        switch (itemid) {
            case 0:
            case -1:
                if (DEBUG) console.log("Failed to create HousingItem " + id + "! Internal error. Report this!");
                return;
            case -2:
                if (DEBUG) console.log("Failed to create HousingItem " + id + "! Template with this ID already exists.");
                return;
            default:
                if (DEBUG) console.log("Unknown error creating HousingItem " + id + ". Please report this ASAP.");
                return;
        }
    }
    if (DEBUG) console.log("HousingItem created with ID " + itemid + "!");
}

//HousingObjectCreate(table_t.model, table_t.icon, table_t.id, table_t.name, 'blue', table_t.type_t);

/* ---------
 * Functions
 * ---------
*/

/**
 * Check if housing object exists (use something unique as parameter please)
 * @param id any string that would define a housing object
 * @returns true or false
 */
function HousingObjectExists(id: string) : boolean {
    if (!fs.existsSync(HS_PATH)) return false;
    const file = fs.readFileSync(HS_PATH);
    let result = JSON.parse(file.toString());
    result = JSON.stringify(result);
    if (!(result as string).includes(id)) return false;
    return true;
}

/**
 * Add a housingobject to the housing objects' database
 * @param model path to model file
 * @param icon path to icon file
 * @param id unique ID (as string) for the object
 * @param name defines the display name of the object
 * @param quality defines the item quality (uncommon, rare, epic, etc...) of the object's item
 * @param type_t object type, if you don't know what you're doing, just leave it at 5
 * @returns void
 */
function AddHousingObject(model: string, icon: string, id: string, name: string, quality: string, type_t: number = 5) {
    let args: string[] = [model, id];
    let obj: object = {model: 'placeholder', icon: 'placeholder', id: 'placeholder', name: 'placeholder', quality: 'gray', type_t: 5};
    let baseobj: object[] = [];
    baseobj.push(obj);
    if (!fs.existsSync(HS_PATH)) fs.writeFileSync(HS_PATH, JSON.stringify(baseobj, null, 2)); // create file if it doesn't exist
    for (let x = 0; x < args.length; x++) {
        if (HousingObjectExists(args[x])) {
            if (DEBUG) console.log("There's already an housing object with ID or model " + args[x]);
            return;
        }
    }
    const file = fs.readFileSync(HS_PATH);
    let stuff: object[] = JSON.parse(file.toString());
    const object: object = {model: model, icon: icon, id: id, name: name, quality: quality, type_t: type_t};
    stuff.push(object);
    fs.writeFileSync(HS_PATH, JSON.stringify(stuff, null, 2));
    if (DEBUG) console.log('HousingObject ' + id + ' added successfully.');
}

/**
 * 
 * @param id 
 * @returns 
 */
function LoadHousingObject(id: string) : object | null {
    if (!HousingObjectExists(id)) return null;
    const file = fs.readFileSync(HS_PATH);
    let y: object[] = [];
    const result: object[] = JSON.parse(file.toString()) as object[];
    if (result) y = result;
    let object: object = {};
    let x = y.find((x: any) => x.id === id);
    if (x) object = x;
    if (!object) return null;
    return object;
}

/**
 * 
 * @param id 
 * @returns 
 */
function RemoveHousingObject(id: string) : boolean {
    let x: object | null = null;
    if (!HousingObjectExists(id)) return false;
    if (LoadHousingObject(id)) x = LoadHousingObject(id) as object;
    const file = fs.readFileSync(HS_PATH);
    const result: object[] = JSON.parse(file.toString()) as object[];
    let index: number;
    if (x) index = result.indexOf(x);
    else return false;
    result.splice(index, 1);
    fs.writeFileSync(HS_PATH, JSON.stringify(result, null, 2));
    return true;
}

/**
 * 
 * @returns 
 */
function LoadHousingObjects() : object[] {
    let result: object[] = [];
    if (!fs.existsSync(HS_PATH)) return [];
    const file = fs.readFileSync(HS_PATH);
    let r = JSON.parse(file.toString());
    let objects: object[] = r as object[];
    result = objects;
    return result;
}

function CreateHousingObjectsFromFile() {
    const objects: object[] = LoadHousingObjects(); // load objects from json
    if (objects === []) {
        console.log('lambmias');
        return;
    } else console.log(objects.length);
    let model: string;
    let icon: string;
    let id: string;
    let name: string;
    let quality: string;
    let type_t: number;
    for (let x = 0; x < objects.length; x++) {
        model = (objects[x] as any).model;
        icon = (objects[x] as any).icon;
        id = (objects[x] as any).id;
        name = (objects[x] as any).name;
        quality = (objects[x] as any).quality;
        type_t = (objects[x] as any).type_t;
        if (!model || !icon || !id || !name || !quality || !type_t) {
            console.log("Fatal error creating housing objects from file.");
            return;
        }
        if (GameObjectTemplateExists(id)) {
            console.log('ligma ' + id);
            if (DEBUG) console.log('Skipping HousingObject ' + id);
        } else {
            if (DEBUG) console.log('Adding HousingObject ' + id + ' from file');
            HousingObjectCreate(model, icon, id, name, quality, type_t);
        }
    }
}

// TODO: remove this for any release
function generatetable() {
    let x: any;
    x = {model: 'World\\Generic\\orc\\passive doodads\\jars\\jarorc01.m2', icon: bottle_green_t.icon, id: 'placeholder1', name: 'xdzors', quality: 'white', type_t: 5};
    AddHousingObject(x.model, x.icon, x.id, x.name, x.quality, x.type_t);
    x = {model: 'World\\Generic\\orc\\passive doodads\\jars\\jarorc02.m2', icon: bottle_green_t.icon, id: 'placeholder2', name: 'xdzors', quality: 'white', type_t: 5};
    AddHousingObject(x.model, x.icon, x.id, x.name, x.quality, x.type_t);
    x = {model: 'World\\Generic\\orc\\passive doodads\\jars\\jarorc03.m2', icon: bottle_green_t.icon, id: 'placeholder3', name: 'xdzors', quality: 'white', type_t: 5};
    AddHousingObject(x.model, x.icon, x.id, x.name, x.quality, x.type_t);
    x = {model: 'World\\Generic\\orc\\passive doodads\\jars\\jarorc04.m2', icon: bottle_green_t.icon, id: 'placeholder4', name: 'xdzors', quality: 'white', type_t: 5};
    AddHousingObject(x.model, x.icon, x.id, x.name, x.quality, x.type_t);
    x = {model: 'World\\Generic\\orc\\passive doodads\\jars\\jarorc05.m2', icon: bottle_green_t.icon, id: 'placeholder5', name: 'xdzors', quality: 'white', type_t: 5};
    AddHousingObject(x.model, x.icon, x.id, x.name, x.quality, x.type_t);
    CreateHousingObjectsFromFile();
}

generatetable();
let q = CHARDB.read('SELECT id FROM ' + db_gameobject_template);
console.log(q);