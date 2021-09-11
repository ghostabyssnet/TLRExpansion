import { std } from "tswow-stdlib";
import { Ids } from "tswow-stdlib/Misc/Ids";
import { DBC, SQL } from "wotlkdata";
import { ArgsSqlStr, Q_exists, Q_exists_string, SqlStr, stringToSql } from "../Database/DatabaseFunctions";
import { CHARDB, db_gameobject_creature, db_gameobject_mirror, db_gameobject_spellitem, db_gameobject_template } from "../Database/DatabaseSetup";
import fs from 'fs';
import { GetGameObjectEntry, GetInternalId } from "./GameObjectDatabase";

/*
 * -------------------------------------
 * CREATURE DATABASE FUNCTIONS
 * General GameObject CREATURES database
 * solutions
 * -------------------------------------
*/

const DEBUG = true;




// TODO: remove this
/*function DevHousingCreatureTemplate() {
    let x: number = -1;
    let name: string = '';
    let id:string = '';
    let query: string = '';
    let _query: string = '';
    if (GetGameObjectInternalIdCount()) x = GetGameObjectInternalIdCount();
    if (x >= 0) {
        for (let i = 1; i <= x; i++) {
            query = 'SELECT name, id FROM ' + db_gameobject_template + ' WHERE ' + db_gameobject_template + '.internalid = ' + i + ';';
            console.log(query);
            let q = CHARDB.read(query);
            if (q[0].name && q[0].id) {
                name = q[0].name as string;
                id = q[0].id as string;
                console.log(name + ':' + id);
                if (name != '' && id != '') HousingCreatureTemplateCreate(name, id);
            }
        }
    }
}

DevHousingCreatureTemplate();*/