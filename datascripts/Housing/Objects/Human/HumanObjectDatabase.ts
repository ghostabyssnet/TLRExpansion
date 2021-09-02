import { bool } from "../../../../../../bin/scripts/tswow/wotlkdata/primitives";
import { CHARDB } from "../../../Database/DatabaseSetup";

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

function stringFromSql(s: string) : string { // only used when we gotta take stuff back idk why I'm obsessed with this
    return s.replace(/zzzz/g, '\\');
}

function stringToSql(s: string) : string {
    return s.replace(/\\/g, 'zzzz');
}

export function HousingBaseExists(model: string) : bool {
    let query: string = "SELECT * FROM gm_go_base WHERE model LIKE " + '\'%' + model + '%\'' + ";";
    console.log(query);
    console.log(model);
    if ((CHARDB.read(query).length < 1)) return false;
    return true;
}

export function AddHousingBase(model: string, icon: string, id: string, name: string, type_t: number) {
    for (let x = 0; x < arguments.length - 1; x++) {
        arguments[x] = stringToSql(arguments[x]);
    }
    let query: string = 'INSERT INTO gm_go_base(model, icon, id, name, type) VALUES (' + '\'' + model + '\'' + ',' + '\'' + icon + '\'' + ',' + '\'' + id + '\'' + ',' + '\'' + name + '\'' + ',' + type_t + ');';
    console.log(query);
    if (HousingBaseExists(model)) return;
    //console.log(query);
    CHARDB.write(query);
}

function SqlTest() {
    let query = 'SELECT * FROM gm_go_base;';
    //let query = 'SELECT * FROM gm_go_base WHERE model = ' + '\'' + stringFromSql(bottle_green_t.model) + '\'' + ";"
    console.log(query);
    let stuff = (CHARDB.read(query));
    //let stuff = (CHARDB.read('SELECT model FROM gm_go_base WHERE model=' + '\'' + bottle_green_t.model + '\'' + ';'));
    console.log(stuff.length);
    if (stuff.length >= 1) console.log(stuff[0].model);
    //console.log(stuff[0].model);
    console.log(JSON.stringify(stuff));
    if (stuff.length >= 1) console.log(stringFromSql(stuff[0].model));
}

SqlTest();

// TODO: remove house

/*CHARDB.write('DELETE FROM gm_go_base;');
CHARDB.write('DELETE FROM gm_go_template;');
CHARDB.write('DELETE FROM gm_go_mirror;');*/

//if (!HousingBaseExists(bottle_green_t.model)) AddHousingBase(bottle_green_t2.model, bottle_green_t2.icon, bottle_green_t2.id, bottle_green_t2.name, bottle_green_t2.type_t);

//console.log(HousingBaseExists(bottle_green_t.model));

export function AddHousingTemplate(entry: number, model: string, icon: string, id: string, name: string, type_t: number) {
    //CHARDB.write('');
}
