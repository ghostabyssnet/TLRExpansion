import { stringToSql } from "../../../Database/DatabaseFunctions";
import { stringFromSql } from "../../../Database/DatabaseFunctions";
import { CHARDB } from "../../../Database/DatabaseSetup";

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

const bottle_green_t2 = {
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

// TODO: change this for release when housing works (remove gm_ prefix)

const gameobject_base_table: string = 'gm_go_base';
const gameobject_template_table: string = 'gm_go_template';
const gameobject_mirror_table: string = 'gm_go_mirror'; // possibly remove this when new tswow patch drops

/* ---------
 * Functions
 * ---------
*/

// utility functions to make our sql not suck because of its \ escape character definitions

export function HousingBaseExists(model: string) : boolean {
    let query: string = "SELECT * FROM gm_go_base WHERE model = " + '\'' + model + '\'' + ";";
    if ((CHARDB.read(query).length < 1)) return false;
    return true;
}

export function AddHousingBase(model: string, icon: string, id: string, name: string, type_t: number) {
    for (let x = 0; x < arguments.length - 1; x++) {
        arguments[x] = stringToSql(arguments[x]);
    }
    let query: string = 'INSERT INTO gm_go_base(model, icon, id, name, type) VALUES (' + '\'' + model + '\'' + ',' + '\'' + icon + '\'' + ',' + '\'' + id + '\'' + ',' + '\'' + name + '\'' + ',' + type_t + ');';
    if (DEBUG) console.log(query);
    if (HousingBaseExists(model)) return;
    if (DEBUG) console.log(query);
    CHARDB.write(query);
}

export function RemoveHousingBase(model: string) : boolean {
    model = stringToSql(model);
    if (!HousingBaseExists(model)) return false;
    let query: string = ''; // TODO
    CHARDB.write(query);
    return true;
}

if (!HousingBaseExists(bottle_green_t2.model)) AddHousingBase(bottle_green_t2.model, bottle_green_t2.icon, bottle_green_t2.id, bottle_green_t2.name, bottle_green_t2.type_t);

export function AddHousingTemplate(entry: number, model: string, icon: string, id: string, name: string, type_t: number) {
    //CHARDB.write('');
}

/*CHARDB.write('DELETE FROM gm_go_base;');
CHARDB.write('DELETE FROM gm_go_template;');
CHARDB.write('DELETE FROM gm_go_mirror;');*/

/*
function SqlTest() {
    //let query = 'SELECT * FROM gm_go_base;';
    let query = 'SELECT * FROM gm_go_base WHERE model = ' + '\'' + bottle_green_t2.model + '\'' + ";"
    let stuff = (CHARDB.read(query));
    //let stuff = (CHARDB.read('SELECT model FROM gm_go_base WHERE model=' + '\'' + bottle_green_t.model + '\'' + ';'));
    if (DEBUG) console.log(stuff.length);
    if (stuff.length >= 1) console.log(stuff[0].model);
    //console.log(stuff[0].model);
    if (DEBUG) console.log(JSON.stringify(stuff));
    if (stuff.length >= 1) console.log(stringFromSql(stuff[0].model));
}
*/