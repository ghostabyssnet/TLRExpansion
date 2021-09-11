import { spawnSync } from "child_process";

let DEBUG = true; // enable/disable verbose

let spells: TSArray<uint32> = [];
let realobjects: TSArray<uint32> = [];
let mirrorobjects: TSArray<uint32> = [];
let mirrorobjectsentry: TSArray<uint32> = []; // original entry instead of mirror entry
let areaids: TSArray<uint32> = [4410]; // TODO: this, properly
let spawnTemplateId: uint32 = 0;
let spawnSpellId: uint32 = 0;
let spawnMirrorId: uint32 = 0;
let spawnCreatureId: uint32 = 0;
let spawnedObject: TSGameObject;
let spawnedCreature: TSCreature;

let posx: float = 0;
let posy: float = 0;
let posz: float = 0;
let map: uint32 = 0;
let o: float = 0;

let globalString: string = '';

/* -----------------
 * Database Querying
 * -----------------
*/
const db_gameobject_mirror: string = 'gm_go_mirror';
const db_gameobject_template: string = 'gm_go_template';
const db_gameobject_spellitem: string = 'gm_go_spellitem';
const db_gameobject_creature: string = 'gm_go_creature';
const db_world_houselist: string = 'gm_world_houselist';
const db_world_garrisonlist: string = 'gm_world_garrisonlist';
const db_character_houses: string = 'gm_char_hs';
const db_character_gameobjects: string = 'gm_char_go';
const db_character_dummies: string = 'gm_char_dm';
const db_guild_houses: string = 'gm_guild_hs';
const db_guild_gameobjects: string = 'gm_guild_go';
const db_guild_dummies: string = 'gm_guild_dm';

const Q_list_spells: string = 'SELECT entry, spellid FROM ' + db_gameobject_spellitem + ';';
const Q_list_mirrors: string = 'SELECT entry, thisentry FROM ' + db_gameobject_mirror + ';';

// TODO:
const Q_go_char_instance_create: string = 'INSERT INTO ' + db_character_gameobjects + '() VALUES ' + '...' + ';';

// TODO: check if object is spawned at player's owned territory


/* ------------------
 * Spells & Functions
 * ------------------
*/

/**
 * 
 * @param spell passthrough
 * @param templateid gameobject template entry
 */
function castHousingSpell(spell: TSSpell, templateid: uint32, creatureid: uint32) {
    spell.GetCaster().ToPlayer().SendBroadcastMessage("[DEBUG] Housing Spell");
    if (DEBUG) console.log("x: " + spell.GetTargetDest().x + ", y: " + spell.GetTargetDest().y + ", z: " + spell.GetTargetDest().z + ", o: " +spell.GetTargetDest().o);
    if (DEBUG) console.log("area id: " + spell.GetCaster().ToPlayer().GetAreaId());
    if (DEBUG) console.log("map: " + spell.GetCaster().ToPlayer().GetMapId());
    if (DEBUG) console.log("test: " + spells.length);
    if (DEBUG) console.log("TemplateId: " + templateid);
    if (DEBUG) console.log("CreatureId: " + creatureid);
    map = spell.GetTargetDest().map;
    posx = spell.GetTargetDest().x;
    posy = spell.GetTargetDest().y;
    posz = spell.GetTargetDest().z;
    o = spell.GetTargetDest().o;
    spawnedObject = spell.GetCaster().ToPlayer().SummonGameObject(templateid, posx, posy, posz, o, 0);
    spawnedCreature = spell.GetCaster().ToPlayer().SpawnCreature(creatureid, posx, posy, posz, o, 5, 0);
    /*console.log("stuff: " + spawnedObject.GetGUIDLow());
    console.log("stuff: " + spawnedObject.GetGUID());*/
    console.log("stuff: " + spawnedCreature.GetGUIDLow());
    console.log("stuff: " + spawnedCreature.GetGUID());
    console.log("stuff: " + spawnedCreature.GetDBTableGUIDLow());
    let _spawnedObject = spawnedObject.GetMap().GetWorldObject(spawnedObject.GetGUID());
    spawnedObject.RemoveFromWorld(true);
    spawnedCreature.DespawnOrUnsummon(100);
    console.log("b: " + _spawnedObject.GetGUID());
}

/**
 * static function to clear this global var
 */
function ClearHousingInfo(): void {
    if (DEBUG) console.log("ClearHousingInfo()");
    let y:number = spells.length;
    let z:number = realobjects.length;
    for (let x = 0; x < y; x++) {
        spells.pop();
    }
    for (let x = 0; x < z; x++) {
        realobjects.pop();
        mirrorobjects.pop();
    }
}

function ClearSpawnInfo(): void {
    if (DEBUG) console.log("ClearSpawnInfo()");
    spawnTemplateId = 0;
    spawnMirrorId = 0;
    spawnCreatureId = 0;
}

function LoadSpellTable(reload: boolean) {
    if (DEBUG) console.log("LoadSpellTable()");
    ClearHousingInfo();
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
            if (DEBUG) console.log("mirror: " + obj.GetName());
            // supposedly we're spawning objects in the spell event
            
        }
    }
    // check if it's a real object
    for (let x = 0; x < realobjects.length; x++) {
        if (realobjects[x] === obj.GetEntry()) {
            c.set(false);
            if (DEBUG) console.log("real: " + obj.GetName());
            if (DEBUG) console.log("instanceid (maybe): " + obj.ToGameObject().GetGUID());
            if (DEBUG) console.log("instanceid (maybe): " + obj.ToGameObject().GetGUIDLow());
            if (DEBUG) console.log("instanceid (maybe): " + obj.ToGameObject().GetDBTableGUIDLow());
            if (DEBUG) console.log("instanceid (maybe): " + obj.GetGUID());
            if (DEBUG) console.log("instanceid (maybe): " + obj.GetGUIDLow());
            if (DEBUG) console.log("instanceid (maybe): " + obj.GetDBTableGUIDLow());
            // supposedly we're spawning objects in the spell event
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
        if (DEBUG) console.log("Placeholder error"); // TODO: this
        LoadSpellTable(false);
    }
    // if it's a housing spell...
    for (let x = 0; x < spells.length; x++) {
        if (spells[x] === spell.GetEntry()) {
            // its a housing spell. let's query
            ClearSpawnInfo();
            let _query:string = 'SELECT entry FROM ' + db_gameobject_spellitem + ' WHERE ' + 'spellid = ' + spell.GetEntry() + ';';
            let query = QueryCharacters(_query);
            if (DEBUG) console.log(_query);
            while (query.GetRow()) {
                spawnTemplateId = query.GetUInt32(0);
            }
            if (DEBUG) console.log(spawnTemplateId);
            /*_query = 'SELECT entry FROM ' + db_gameobject_template + ' WHERE spellid = ' + spell.GetEntry() + ';';
            query = QueryCharacters(_query);
            if (DEBUG) console.log(_query);
            while (query.GetRow()) {
                spawnTemplateId = query.GetUInt32(0);
            }*/
            // no need for mirrors? -> let _query = QueryCharacters('SELECT thisentry FROM '...)
            _query = 'SELECT thisentry FROM ' + db_gameobject_creature + ' WHERE ' + 'entry = ' + spawnTemplateId + ';';
            query = QueryCharacters(_query);
            if (DEBUG) console.log(_query);
            while (query.GetRow()) {
                spawnCreatureId = query.GetUInt32(0);
            }
            if (DEBUG) console.log(spawnCreatureId);
            castHousingSpell(spell, spawnTemplateId, spawnCreatureId); // TODO: add mirrors if something goes wrong
            return;
        }
    }
}

function onHousingCommand(player: TSPlayer, type: number, lang: number, msg: TSMutableString) {
    if (msg.get().includes("!a")) {
        console.log("testA");
        player.SendBroadcastMessage("assert A!");
        let query: string = 'SELECT * FROM gameobject WHERE guid=90446;';
        console.log(query);
        const _query: TSDatabaseResult = QueryWorld(query);
        while (_query.GetRow()) {
            console.log(_query.GetString(0));
        }
    }
}

export function HousingSpell(events: TSEventHandlers) {
    events.World.OnConfigLoad((reload)=>{LoadSpellTable(reload);});
    events.Spells.OnCast((spell)=>{onCast(spell);}); // forward any spell to onCast
    events.GameObjects.OnCreate((obj,c)=>{onGameObjectCreate(obj, c)});
    events.Player.OnSay((player, msgType, lang, msg) => {onHousingCommand(player, msgType, lang, msg);});
}