let DEBUG = true; // enable/disable verbose

let spells: TSArray<uint32> = [];
let realobjects: TSArray<uint32> = [];
let mirrorobjects: TSArray<uint32> = [];
let mirrorobjectsentry: TSArray<uint32> = []; // original entry instead of mirror entry

/* -----------------
 * Database Querying
 * -----------------
*/
const db_gameobject_spellitem: string = 'gm_go_spellitem';
const db_gameobject_mirror: string = 'gm_go_mirror';
const Q_list_spells: string = 'SELECT entry, spellid FROM ' + db_gameobject_spellitem + ';';
const Q_list_mirrors: string = 'SELECT entry, thisentry FROM ' + db_gameobject_mirror + ';';

/* ------------------
 * Spells & Functions
 * ------------------
*/

function castHousingSpell(spell: TSSpell, id: number) {
    spell.GetCaster().ToPlayer().SendBroadcastMessage("[DEBUG] Housing Spell");
    console.log("x: " + spell.GetTargetDest().x + ", y: " + spell.GetTargetDest().y + ", z: " + spell.GetTargetDest().z + ", o: " +spell.GetTargetDest().o);
    console.log("area id: " + spell.GetCaster().ToPlayer().GetAreaId());
    console.log("test: " + spells.length);
}

function LoadSpellTable(reload: boolean) {
    if (DEBUG) console.log("LoadSpellTable()");
    let y: number = spells.length;
    let z:number = realobjects.length;
    for (let x = 0; x < y; x++) {
        spells.pop();
    }
    for (let x = 0; x < z; x++) {
        realobjects.pop();
        mirrorobjects.pop();
    }
    const _mirror: TSDatabaseResult = QueryCharacters(Q_list_mirrors);
    while(_mirror.GetRow()) {
        // idk what to do with uint32(0) right now but I feel like it will be useful in the future as a comparison
        mirrorobjectsentry.push(_mirror.GetUInt32(0));
        mirrorobjects.push(_mirror.GetUInt32(1));
    }
    const _spells: TSDatabaseResult = QueryCharacters(Q_list_spells);
    while(_spells.GetRow()) {
        realobjects.push(_spells.GetUInt32(0));
        if (DEBUG) console.log(_spells.GetUInt32(0));
        spells.push(_spells.GetUInt32(1));
        if (DEBUG) console.log(_spells.GetUInt32(1));
    }
}

function onGameObjectCreate(obj: TSGameObject, c: TSMutable<boolean>) {
    if (realobjects.length <= 1) LoadSpellTable(false);
    if (mirrorobjects.length <= 1) LoadSpellTable(false);
    // check if it's a mirror first
    // if we spawned a mirror, we despawn it and spawn the original object
    for (let x = 0; x < mirrorobjects.length; x++) {
        if (mirrorobjects[x] === obj.GetEntry()) {
            c.set(true);
            console.log("mirror: " + obj.GetName());
            // TODO: spawn original object now
        }
    }
    // check if it's a real object
    for (let x = 0; x < realobjects.length; x++) {
        if (realobjects[x] === obj.GetEntry()) {
            c.set(false);
            console.log("real: " + obj.GetName());
            // TODO: spawn creature and do other mad stuff
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
            return;
        }
    }
}

export function HousingSpell(events: TSEventHandlers) {
    events.World.OnConfigLoad((reload)=>{LoadSpellTable(reload);});
    events.Spells.OnCast((spell)=>{onCast(spell);}); // forward any spell to onCast
    events.GameObjects.OnCreate((obj,c)=>{onGameObjectCreate(obj, c)})
}