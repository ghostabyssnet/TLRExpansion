import { Ids } from "tswow-stdlib/Misc/Ids";
import { DBC } from "wotlkdata";
import { ArgsSqlStr, Q_exists_string, SqlStr, stringToSql } from "../../../Database/DatabaseFunctions";
import { CHARDB, db_gameobject_base, db_gameobject_template } from "../../../Database/DatabaseSetup";

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

/**
 * Creates a new GameObject Base Template and adds it to our database
 * @param model path to our model (raw, don't use toSql)
 * @param icon path to our icon (raw, don't use toSql)
 * @param id a unique id for TSWoW itself, doesn't need to be a number
 * @param name our object's name in-game, doesn't need to be unique
 * @param type our GameObjectType. read the wiki! it's almost always 5
 */
export function GameObjectBaseCreate(model: string, icon: string, id: string, name: string, type_t: number = 5) {
    let args = [];
    for (let x = 0; x < arguments.length; x++) {
        args[x] = stringToSql(arguments[x].toString());
    }
    let query: string = 'INSERT INTO ' + db_gameobject_base + '(model, icon, id, name, type) VALUES (' + '\'' + args[0] + '\'' + ',' + '\'' + args[1] + '\'' + ',' + '\'' + args[2] + '\'' + ',' + '\'' + args[3] + '\'' + ',' + type_t + ');';
    if (HousingBaseExists(args[0])) return;
    if (DEBUG) console.log(query);
    CHARDB.write(query);
    GameObjectTemplateRegister(model, icon, id, name, type_t); // this goes to part 2
}

export function GameObjectBaseDelete(model: string) : boolean {
    model = stringToSql(model);
    if (!HousingBaseExists(model)) return false;
    let query: string = 'DELETE FROM ' + db_gameobject_base + ' WHERE model = ' + SqlStr(model) + ';';
    CHARDB.write(query);
    return true;
}

/**
 * == DON'T CALL == GameObjectBaseCreate() calls this
 * @param model ... seriously don't call this by yourself
 * @param icon 
 * @param id 
 * @param name 
 * @param type 
 */
function GameObjectTemplateRegister(model: string, icon: string, id: string, name: string, type: number = 5) {
    // careful: this will always create a new gameobject in the game database, even if everything else fails

    // creates a new gameobject display info
    let dinfo = DBC.GameObjectDisplayInfo.add(Ids.GameObjectDisplay.id())
    .ModelName.set(model);

    // creates a unique id for tswow for this gameobject
    let tswowid: number = Ids.GameObjectTemplate.id("TLRHousing-", id); // read below
    // tswow creates an ID for this by itself, we will end up with 3 ids: internalid for SQL, id (TLRHousing-...) for tswow, ID for the actual game
    
    if (!tswowid) console.log("TSWoW couldn't generate an TSWOWID for " + dinfo + '(' + model +')'); // something went terribly wrong
    GameObjectTemplateCreate(tswowid, dinfo.ID.get(), icon, id, name, type); // time to create the actual template
}

/**
 * == DON'T CALL == GameObjectTemplateRegister() calls this
 * @param entry ...don't call this by yourself bud
 * @param displayid a displayId defined in GameObjectTemplateRegister()
 * @param icon 
 * @param id 
 * @param name 
 * @param type 
 * @returns 
 */
function GameObjectTemplateCreate(entry: number, displayid: number, icon: string, id: string, name: string, type: number = 5) : number {
    // TODO: maybe change this for try/catch whenever I'm sure that try/catch won't break SQL for some reason
    let args = [];
    for (let x = 2; x < arguments.length; x++) {
        args[x-2] = stringToSql(arguments[x].toString());
    }
    args = ArgsSqlStr(args);
    let query: string = 'INSERT INTO ' + db_gameobject_template + '(entry, displayid, icon, id, name, type) VALUES (' + entry + ',' + displayid + ',' + args[0] + ',' + args[1] + ',' + args[2] + ',' + type + ');';
    if (DEBUG) console.log(query);
    CHARDB.write(query);
    return 1;
}

/**
 * Deletes a GameObjectTemplate and its base
 * @param id a tswowid (without TLRHousing- or any prefix)
 */
function GameObjectTemplateDelete(id: string) {

}

function GameObjectInstanceCreate() {

}

function GameObjectInstanceRemove() {

}

/* ---------
 * Functions
 * ---------
*/

// utility functions to make our sql not suck because of its \ escape character definitions

export function HousingBaseExists(model: string) : boolean {
    return Q_exists_string(model, db_gameobject_base);
}

//if (!HousingBaseExists(bottle_green_t2.model)) 
    //GameObjectBaseCreate(bottle_green_t2.model, bottle_green_t2.icon, bottle_green_t2.id, bottle_green_t2.name, bottle_green_t2.type_t);

export function AddHousingTemplate(entry: number, model: string, icon: string, id: string, name: string, type_t: number) {
    //CHARDB.write('');
}

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
