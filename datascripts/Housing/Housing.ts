import { std } from "tswow-stdlib";
import { CHARDB, db_gameobject_template } from "../Database/DatabaseSetup";

// TODO: create types

// ----------------
// Creature Factory
// ----------------

const INVIS = std.Spells.load(67765);
//console.log(INVIS.objectify());

// ------------
// Item Factory
// ------------

/*const test = std.Items.load(100020);
console.log(test.objectify());

const x = CHARDB.read('SELECT * FROM ' + db_gameobject_template);
console.log(x);*/