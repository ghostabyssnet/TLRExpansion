import { DBC,SQL } from 'wotlkdata'
import { Ids } from 'tswow-stdlib/Misc/Ids'
import { std } from "tswow-stdlib";
import { Pos } from "tswow-stdlib/Misc/Position";
import { GameObjectTemplate } from 'tswow-stdlib/GameObject/GameObjectTemplate';

/*export const HOUSING_SKILL = std.SkillLines
    .createClass("TLRHousing", "housing-skill", 8);
HOUSING_SKILL.Name.enGB.set(`Housing`);*/

// /\ disabled because I changed housing to be item based instead of a skill/profession

const HOUSING_SPELL = std.Spells.create("TLRHousing", "housing-spell", 7301)
    .Name.enGB.set("Build House")
    .Description.enGB.set('Allows the player to modify their house.')
    .CastTime.set(0,0,0)
    .Power.setMana(0)
    .Cooldown.set(0, 0, 0, 0)
    .Duration.set(3600000, 0, 3600000)
    HOUSING_SPELL.Effects.get(0).AuraType.setDummy();
    HOUSING_SPELL.Effects.get(1).clear();

const GM_HOUSING = std.Spells.create("TLRHousing", "gamemaster", 2061)
    .Name.enGB.set("GM Housing Stuff")
    .CastTime.set(0, 0, 0)
    .Power.setMana(0)
    .Cooldown.set(0, 0, 0, 0)
    .Duration.set(0, 0, 0);
GM_HOUSING.Effects.get(0).clear();