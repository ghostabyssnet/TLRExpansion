let spells: number[] = [200005, 200006];
let x: TSSpell;

function castHousingSpell(spell: TSSpell, id: number) {
    spell.GetCaster().ToPlayer().SendBroadcastMessage("[DEBUG] Housing Spell");
}

function onCast(spell: TSSpell) {
    if(spell.GetCaster().IsNull()) {
        return;
    }

    if(!spell.GetCaster().IsPlayer()) {
        return;
    }

    spell.GetCaster().ToPlayer().SendBroadcastMessage("[DEBUG] Any Spell");
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