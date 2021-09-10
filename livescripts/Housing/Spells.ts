let DEBUG = true; // enable/disable verbose

let spells: TSArray<uint32> = [];
let objects: TSArray<uint32> = [];
let global: uint32 = 0;

/* -----------------
 * Database Querying
 * -----------------
*/
const db_gameobject_spellitem: string = 'gm_go_spellitem';
const Q_list_spells: string = 'SELECT entry, spellid FROM ' + db_gameobject_spellitem + ';';

/* ------------------
 * Spells & Functions
 * ------------------
*/

function castHousingSpell(spell: TSSpell, id: number) {
    spell.GetCaster().ToPlayer().SendBroadcastMessage("[DEBUG] Housing Spell");
    console.log("x: " + spell.GetTargetDest().x + ", y: " + spell.GetTargetDest().y + ", z: " + spell.GetTargetDest().z + ", o: " +spell.GetTargetDest().o);
    console.log("area id: " + spell.GetCaster().ToPlayer().GetAreaId());
}

function LoadSpellTable(reload: boolean) {
    if (DEBUG) console.log("LoadSpellTable()");
    const _spells: TSDatabaseResult = QueryCharacters(Q_list_spells);
    while(_spells.GetRow()) {
        objects.push(_spells.GetUInt32(0));
        if (DEBUG) console.log(_spells.GetUInt32(0));
        spells.push(_spells.GetUInt32(1));
        if (DEBUG) console.log(_spells.GetUInt32(1));
        // TODO: add mirror template entry here
    }
}

function onGameObjectCreate(obj: TSGameObject, c: TSMutable<boolean>) {
    if (objects.length <= 1) LoadSpellTable(false);
    for (let x = 0; x < objects.length; x++) {
        if (objects[x] === obj.GetEntry()) {
            c.set(true);
            console.log(obj.GetName());
        }
    }
}

function onCast(spell: TSSpell) {
    if(spell.GetCaster().IsNull()) {
        return;
    }

    if(!spell.GetCaster().IsPlayer()) {
        return;
    }
    // load stuff if for some reason there's no spells
    if (spells.length <= 1 || spell.GetEntry() == 200007) {
        console.log("Placeholder error"); // TODO: this
        LoadSpellTable(false);
    }
    // if it's a housing spell...
    for (let x = 0; x < spells.length; x++) {
        if (spells[x] === spell.GetEntry()) {
            castHousingSpell(spell, spell.GetEntry());
        }
    }
}

export function HousingSpell(events: TSEventHandlers) {
    events.World.OnConfigLoad((reload)=>{LoadSpellTable(reload);});
    events.Spells.OnCast((spell)=>{onCast(spell);}); // forward any spell to onCast
    events.GameObjects.OnCreate((obj,c)=>{onGameObjectCreate(obj, c)})
}