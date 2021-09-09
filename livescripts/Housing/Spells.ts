let DEBUG = true; // enable/disable verbose

let spells: number[] = [200012, 200013, 200016, 200018];
let x: TSSpell;
let global: uint32 = 0;

/* -----------------
 * Database Querying
 * -----------------
*/



/* -----------------
 * Database Saving
 * -----------------
*/

//let t = QueryCharacters()

/* ------------------
 * Spells & Functions
 * ------------------
*/

function castHousingSpell(spell: TSSpell, id: number) {
    spell.GetCaster().ToPlayer().SendBroadcastMessage("[DEBUG] Housing Spell");
    console.log("x: " + spell.GetTargetDest().x + ", y: " + spell.GetTargetDest().y + ", z: " + spell.GetTargetDest().z + ", o: " +spell.GetTargetDest().o);
    console.log("area id: " + spell.GetCaster().ToPlayer().GetAreaId());
}

function onGameObjectCreate(obj: TSGameObject, c: TSMutable<boolean>) {
    if (obj.GetName() == "Placeholder") c.set(true); // cancel
}

function onCast(spell: TSSpell) {
    if(spell.GetCaster().IsNull()) {
        return;
    }

    if(!spell.GetCaster().IsPlayer()) {
        return;
    }

    // if it's a housing spell...
    for (let x = 0; x < spells.length; x++) {
        if (spells[x] === spell.GetEntry()) {
            castHousingSpell(spell, spell.GetEntry());
        }
    }
}

export function HousingSpell(events: TSEventHandlers) {
    events.Spells.OnCast((spell)=>{onCast(spell);}); // forward any spell to onCast
    events.GameObjects.OnCreate((obj,c)=>{onGameObjectCreate(obj, c)})
}