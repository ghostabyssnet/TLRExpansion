import { DBC,SQL } from 'wotlkdata'
import { Ids } from 'tswow-stdlib/Misc/Ids'
import { std } from "tswow-stdlib";
import { Pos } from "tswow-stdlib/Misc/Position";
import { GameObjectTemplate } from 'tswow-stdlib/GameObject/GameObjectTemplate';
import { human_objects } from './Objects/Human/HumanObjectDatabase';
import { CHARDB } from '../Database/DatabaseSetup';

// TODO: create types

// ----------------
// Creature Factory
// ----------------

const INVIS = std.Spells.load(67765);
//console.log(INVIS.objectify());

// ------------
// Item Factory
// ------------

// import from database

//const TEMPLATE_INFO = CHARDB.read('');

let model : string;
let icon : string;
let template : string;
let name : string;
let type_t: number;

for (let x = 0; x < human_objects.length; x++) {
    model = human_objects[x].model;
    template = human_objects[x].id;
    name = human_objects[x].name;
    icon = human_objects[x].icon;
    type_t = human_objects[x].type_t;
    // set display info
    let dinfo = DBC.GameObjectDisplayInfo.add(Ids.GameObjectDisplay.id())
    .ModelName.set(model);
    // set game object template
    let tmp = SQL.gameobject_template
    .add(Ids.GameObjectTemplate.id("TLRHousing",template))
    .displayId.set(dinfo.ID.get())
    .type.set(type_t)
    .size.set(1)
    .Data0.set(0)
    .Data1.set(0)
    .name.set(name);
    // create the spell to be used when you attempt to place the item
    let spl = std.Spells.create("TLRHousing", template, 61031);
    spl.Name.enGB.set(name);
    spl.Description.enGB.set('Used in houses.');
    spl.CastTime.set(0,0,0);
    spl.Duration.set(1000, 0, 1000);
    spl.Icon.set(icon);
    
    // set the gameobject to spawn
    spl.Effects.get(0).EffectType.setTransDoor().GameObjectTemplate.set(tmp.entry.get());
    spl.Range.set(0, 10, 0, 10);

    // create the actual item
    let item = std.Items.create("TLRHousing", template, 44606)
        .Name.enGB.set(name)
        .Quality.setWhite()
        .Bonding.setNoBounds()
        .Description.enGB.set("Used in houses.")
        .DisplayInfo.Icon.set(icon).end
        .Spells.clearAll()
        .Spells.add(spl.ID).end
    console.log("Loaded Housing GameObject: " + human_objects[x].name + " " + human_objects[x].id + " ID: " + item.ID);
    console.log("DEBUG: SPELLID " + spl.ID);
    console.log("type: " + tmp.type.get());
}

//console.log(std.Spells.load(200013).objectify());