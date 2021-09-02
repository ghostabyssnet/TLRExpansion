let DEBUG = true; // enable/disable verbose

let spells: number[] = [200012, 200013];
let x: TSSpell;

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
}