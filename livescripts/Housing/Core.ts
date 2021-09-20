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
let map: uint16 = 0;
let o: float = 0;

let globalString: string = '';

// TODO: README
// setting base phasemask to 3 so it works for phases 1 and 2
// change this later when you add a proper phasing system 
const BASE_PHASEMASK: uint8 = 3;

// TODO: improve this later
const MAP_EASTERN: uint8 = 0;
const MAP_KALIMDOR: uint8 = 1;

/* -------
 * Classes
 * -------
*/

// TODO: test this
class HousingDatabase extends TSClass {
    private charLength: uint32 = 0;
    private guildLength: uint32 = 0;
    private templateLength: uint32 = 0; // idk if this is needed
    constructor() {
        super();
        this.SetLength();
    }
// TODO: test this
    SetLength() : void {
        let charLength: uint32 = this.GetDatabaseLength('guid', db_character_gameobjects);  
        let guildLength: uint32 = this.GetDatabaseLength('guildid', db_guild_gameobjects);  
        this.charLength = charLength;
        this.guildLength = guildLength;
    }
// TODO: test this
    GetCharacterLength() : uint32 {
        return this.charLength;
    }
// TODO: test this
    GetGuildLength() : uint32 {
        return this.guildLength;
    }
// TODO: test this
    /**
     * 
     * @param guid instanceId
     */
    SpawnCharacterObject(map: TSMap, guid: uint64) : void {
        let query:string = "SELECT guid, templateId, instanceId, map, locx, locy, locz, loco FROM " + db_character_gameobjects + " WHERE instanceId = " + guid + ";";
        if (DEBUG) console.log(query);
        let q: TSDatabaseResult = QueryCharacters(query);
        while (q.GetRow()) {
            let player_guid = q.GetUInt32(0);
            let templateid = q.GetUInt32(1);
            let guid = q.GetUInt64(2);
            let pos_map = q.GetUInt32(3);
            let pos_x = q.GetFloat(4);
            let pos_y = q.GetFloat(5);
            let pos_z = q.GetFloat(6);
            let pos_o = q.GetFloat(7);
            let object = new CharHousingObject(player_guid, guid, templateid, pos_x, pos_y, pos_z, pos_o, pos_map);
            object.Spawn(map, true);
        }
    }
// TODO: test this
    /**
     * 
     * @param guid instanceId
     */
    /* TODO: this SpawnGuildObject(map: TSMap, guid: uint64) : void {
        let query:string = "SELECT guid, templateId, instanceId, map, locx, locy, locz, loco FROM " + db_character_gameobjects + " WHERE instanceId = " + guid + ";";
        if (DEBUG) console.log(query);
        let q: TSDatabaseResult = QueryCharacters(query);
        while (q.GetRow()) {
            let player_guid = q.GetUInt32(0);
            let templateid = q.GetUInt32(1);
            let guid = q.GetUInt64(2);
            let pos_map = q.GetUInt32(3);
            let pos_x = q.GetFloat(4);
            let pos_y = q.GetFloat(5);
            let pos_z = q.GetFloat(6);
            let pos_o = q.GetFloat(7);
            let object = new CharHousingObject(guid, templateid, pos_x, pos_y, pos_z, pos_o, pos_map);
            object.Spawn(map, true);
        }
    }*/
// TODO: test this
    Confirm(map: TSMap) : void {
        this.SetLength(); // calling this just to be sure it's updated
        let query:string = "SELECT instanceId, map FROM " + db_character_gameobjects + ";";
        if (DEBUG) console.log(query);
        let q: TSDatabaseResult = QueryCharacters(query);
        while (q.GetRow()) {
            let instanceId: uint64 = q.GetUInt64(0);
            let mapId: uint16 = q.GetUInt16(1);
            if (map.GetMapId() != mapId) continue;
            if (!HousingObject.IsSpawned(map, instanceId)) {
                this.SpawnCharacterObject(map, instanceId);
            }
        }
        let _query:string = "SELECT instanceId, map FROM " + db_guild_gameobjects + ";";
        if (DEBUG) console.log(_query);
        let _q: TSDatabaseResult = QueryCharacters(_query);
        while (_q.GetRow()) {
            let instanceId: uint64 = _q.GetUInt64(0);
            let mapId: uint16 = _q.GetUInt16(1);
            if (map.GetMapId() != mapId) continue;
            if (!HousingObject.IsSpawned(map, instanceId)) {
                // TODO: this.SpawnGuildObject(map, instanceId);
            }
        }
    }
// TODO: test this
    private GetDatabaseLength(what: string, table: string) : uint32 {
        let result: uint32 = 0;
        const query = "SELECT COUNT(" + what + ") FROM " + table + ";";
        if (DEBUG) console.log(query);
        let q: TSDatabaseResult = QueryCharacters(query);
        while (q.GetRow()) {
            result = q.GetUInt32(0);
        }
        if (DEBUG) console.log("GetDatabaseLength(): " + result);
        return result;
    }

    /**
     * 
     * @param entry spellid
     * @returns 
     */
    static GetSpawnTemplateId(entry: uint32) : uint32 {
        let _spawnTemplateId : uint32 = -1;
        let _query:string = 'SELECT entry FROM ' + db_gameobject_spellitem + ' WHERE ' + 'spellid = ' + entry + ';';
        let query: TSDatabaseResult = QueryCharacters(_query);
        if (DEBUG) console.log(_query);
        while (query.GetRow()) {
            _spawnTemplateId = query.GetUInt32(0);
        }
        return _spawnTemplateId;
    }

    /**
     * 
     * @param entry spawntemplateid
     * @returns 
     */
    static GetSpawnCreatureId(entry: uint32) : uint32 {
        let _spawnCreatureId : uint32 = -1;
        let _query: string = 'SELECT thisentry FROM ' + db_gameobject_creature + ' WHERE ' + 'entry = ' + entry + ';';
        let query: TSDatabaseResult = QueryCharacters(_query);
        if (DEBUG) console.log(_query);
        while (query.GetRow()) {
            _spawnCreatureId = query.GetUInt32(0);
        }
        return _spawnCreatureId;
    }
}
// maybe convert this to interface?
class HousingObject extends TSClass {
    guid: uint64;
    templateid: uint32;
    pos_x: float;
    pos_y: float;
    pos_z: float;
    pos_o: float;
    pos_map: uint32;
    constructor(guid: uint64, templateid: uint32, pos_x: float, pos_y: float, pos_z: float, pos_o: float, pos_map: uint32) {
        super();
        this.guid = guid;
        this.templateid = templateid;
        this.pos_x = pos_x;
        this.pos_y = pos_y;
        this.pos_z = pos_z;
        this.pos_o = pos_o;
        this.pos_map = pos_map;
    }
// TODO: test this
    static IsSpawned(map: TSMap, guid: uint64): boolean {
        if (!map.GetWorldObject(guid).GetGUID()) return false;
        return true;
    }
}

class CharHousingObject extends HousingObject {
    player_guid: uint32;
    constructor(player_guid: uint32, guid: uint64, templateid: uint32, pos_x: float, pos_y: float, pos_z: float, pos_o: float, pos_map: uint32) {
        super(guid, templateid, pos_x, pos_y, pos_z, pos_o, pos_map);
        this.player_guid = player_guid;
    }
    GetDummyTemplate() : uint32 {
        let result: uint32 = 0;
        let query:string = 'SELECT templateId from ' + db_character_dummies + ' WHERE instanceId = ' + this.guid + ';';
        if (DEBUG) console.log(query);
        let q: TSDatabaseResult = QueryCharacters(query);
        while (q.GetRow()) result = q.GetUInt32(0);
        return result;
    }

    RegisterDummy(creature_id: uint64) {
        let query:string = 'INSERT INTO ' + db_character_dummies + '(guid, templateId, instanceId, map, locx, locy, locz, loco) VALUES ' + this.player_guid + ',' + this.templateid + ',' + creature_id + ',' + this.pos_map + ',' + this.pos_x + ',' + this.pos_y + ',' + this.pos_z + ',' + this.pos_o + ';';
        if (DEBUG) console.log(query);
        QueryCharacters(query);
    }

    /**
     * TODO!!!
     */
    SpawnDummy(map: TSMap, obj: TSGameObject) {
        // TODO: this
        let cr: TSCreature = obj.SpawnCreature(this.GetDummyTemplate(), this.pos_x, this.pos_y, this.pos_z, this.pos_o, 8, 0);
        this.RegisterDummy(cr.GetGUID());
    }
// TODO: test this    
    Spawn(map: TSMap, with_dummy: boolean) {
        if (DEBUG) console.log("CharHousingObject::Spawn()");
        if (map.GetMapId() != this.pos_map) {
            if (DEBUG) console.log("Error spawning CharHousingObject " + this.guid + ": Map ID does not match database.");
            return;
        }
        if (HousingObject.IsSpawned(map, this.guid)) return;
        // FIXME: #17 make this thing below not suck
        let obj = map.GetWorldObject(300000).SummonGameObject(this.templateid, this.pos_x, this.pos_y, this.pos_z, this.pos_o, 0);
        // TODO: this
        if (with_dummy) {

        }
    }

    /**
     * registers a obj, make sure it was already spawned
     */
    Register() {
        // TODO: delete/modify those when we add proper phase masking
        // idk if spawn mask should be removed though (15 means spawn for any dungeon in any difficulty)
        let spawnMask: uint8 = 15;
        let phaseMask: uint16 = BASE_PHASEMASK;
        if (DEBUG) console.log("CharHousingObject::Register()");
        let query: string = 'INSERT INTO ' + db_character_gameobjects + '(guid, templateId, instanceId, map, locx, locy, locz, loco) VALUES (' + this.player_guid + ',' + this.templateid + ',' + this.guid + ',' + this.pos_map + ',' + this.pos_x + ',' + this.pos_y + ',' + this.pos_z + ',' + this.pos_o + ');';
        if (DEBUG) console.log(query);
        QueryCharacters(query);
    }

// TODO: test this
    Despawn(map: TSMap, with_dummy: boolean) {
        if (DEBUG) console.log("CharHousingObject::Despawn()");
        if (map.GetMapId() != this.pos_map) {
            if (DEBUG) console.log("Error despawning HousingObject " + this.guid + ": Map ID does not match database.");
            return;
        }
        if (!HousingObject.IsSpawned(map, this.guid)) return;
        map.GetWorldObject(this.guid).ToGameObject().RemoveFromWorld(true);
        // TODO: this boi
        if (with_dummy) console.log("TODO: despawn dummy in here as well");
    }
// TODO: test this
    Unregister() {
        if (DEBUG) console.log("CharHousingObject::Unregister()");
        let query: string = 'DELETE FROM ' + db_character_gameobjects + ' WHERE instanceId=' + this.guid + ';';
        if (DEBUG) console.log(query);
        QueryCharacters(query);
    }
}

// TODO: do GUILDHOUSINGOBJECT here (copypaste)

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
const Q_go_char_instance_remove: string = 'REMOVE FROM? ' + db_character_gameobjects + '() VALUES ' + '...' + ';';

// TODO:
const Q_go_guild_instance_create: string = 'INSERT INTO ' + db_character_gameobjects + '() VALUES ' + '...' + ';';

// TODO: check if object is spawned at the player's owned territory


/* ------------------
 * Spells & Functions
 * ------------------
*/

/**
 * summons a housing object
 * @param spell spell used to summon the object
 * @param templateid gameobject template id (entry)
 * @param creatureid dummy creature id (entry)
 */
export function CreateCharHousingObject(spell: TSSpell, templateid: uint32, creatureid: uint32) {
    if (DEBUG) console.log("CreateCharHousingObject()");
    map = spell.GetTargetDest().map;
    posx = spell.GetTargetDest().x;
    posy = spell.GetTargetDest().y;
    posz = spell.GetTargetDest().z;
    o = spell.GetTargetDest().o;
    let _obj: TSWorldObject = spell.GetCaster().ToPlayer().SummonGameObject(templateid, posx, posy, posz, o, 0);
    let obj = new CharHousingObject(spell.GetCaster().ToPlayer().GetGUID(), _obj.GetGUID(), templateid, posx, posy, posz, o, map);
    let cr: TSCreature = spell.GetCaster().ToPlayer().SpawnCreature(creatureid, posx, posy, posz, o, 8, 0);
    obj.Register();
    obj.RegisterDummy(creatureid);
}

/**
 * 
 * @param spell passthrough
 * @param templateid gameobject template entry
 * @param creatureid dummy creature template entry
 */
function castHousingSpell(spell: TSSpell, templateid: uint32, creatureid: uint32) {
    // TODO: show this only if the player is a GM
    spell.GetCaster().ToPlayer().SendBroadcastMessage("[DEBUG] Housing Spell");
    // TODO: charHousingObject tests here
    CreateCharHousingObject(spell, templateid, creatureid);
}

// backup if something goes wrong
function backupHousingSpell(spell: TSSpell, templateid: uint32, creatureid: uint32) {
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
    let test: TSWorldObject = spell.GetCaster().ToPlayer().GetMap().GetWorldObject(spawnedObject.GetGUID());
    console.log("lets see guid: " + test.GetName() + "::" + test.GetGUID());
    console.log("st: " + spell.GetCaster().GetMap().GetWorldObject(spawnedObject.GetGUID()).GetGUID());
    let _query: TSDatabaseResult = QueryWorld('SELECT id FROM gameobject WHERE guid = ' + spawnedObject.GetGUID());
    while (_query.GetRow()) {
        console.log("query 1: " + _query.GetUInt16(0));
    }
    // test2: lets see all guids from our template id
    /*let t: string = "SELECT guid FROM gameobject;";
    let _query2: TSDatabaseResult = QueryWorld(t);
    console.log(t);
    console.log("cheddar: " + _query2.IsValid());
    while (_query2.GetRow()) {
        console.log("query 2: " + _query2.GetUInt64(0));
    }*/
    spawnedCreature = spell.GetCaster().ToPlayer().SpawnCreature(creatureid, posx, posy, posz, o, 5, 0);
    /*console.log("stuff: " + spawnedObject.GetGUIDLow());
    console.log("stuff: " + spawnedObject.GetGUID());*/
    console.log("stuff: " + spawnedCreature.GetGUIDLow());
    console.log("stuff: " + spawnedCreature.GetGUID());
    console.log("stuff: " + spawnedCreature.GetDBTableGUIDLow());
    let _spawnedObject = spawnedObject.GetMap().GetWorldObject(spawnedObject.GetGUID());
    // spawnedObject.IsSpawned();
    //spawnedObject.RemoveFromWorld(true);
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
    // TODO: convert those to separate functions that return boolean
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
            // supposedly we're spawning objects in the spell event
        }
    }
}

// TODO: check if player owns the house, if it's a housing terrain, etc
function canCastHousingSpell(player: TSPlayer) : boolean {
    return true;
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
            spawnTemplateId = HousingDatabase.GetSpawnTemplateId(spell.GetEntry());
            if (DEBUG) console.log("spawnTemplateId: " + spawnTemplateId);
            spawnCreatureId = HousingDatabase.GetSpawnCreatureId(spawnTemplateId);
            if (DEBUG) console.log("spawnCreatureId: " + spawnCreatureId);
            if (spawnTemplateId == -1 || spawnCreatureId == -1) return; // avoid errors, TODO: improve this I guess
            let player: TSPlayer = spell.GetCaster().ToPlayer();
            if (canCastHousingSpell(player)) castHousingSpell(spell, spawnTemplateId, spawnCreatureId);
            return;
        }
    }
}

function onHousingCommand(player: TSPlayer, type: number, lang: number, msg: TSMutableString) {
    if (msg.get().includes("!a")) {
        console.log("testA");
        player.SendBroadcastMessage("assert A!");
        let query: string = 'SELECT guid FROM gameobject WHERE guid=90446;';
        console.log(query);
        const _query: TSDatabaseResult = QueryWorld(query);
        while (_query.GetRow()) {
            console.log(_query.GetString(0));
        }
    }
}

/* ------------------
 * Database Functions
 * ------------------
*/

function ConfirmHousingSystem(map: TSMap) {
    if (DEBUG) console.log("ConfirmHousingSystem()");
    //ConfirmCharacterTable(map);
}

function LoadHousingObjects(reload: boolean) {
    let database: HousingDatabase = new HousingDatabase();

}

function DatabaseTests(player: TSPlayer) {
    let t = new HousingDatabase();
    let x: uint32;
    x = t.GetCharacterLength();
    console.log(x);
    x = t.GetGuildLength();
    console.log(x);
}

function assert() {
    //console.log("assert: " + HousingDummy.IsRegistered(1));
}

// TODO: delete this
function onDatabaseCommand(player: TSPlayer, type: number, lang: number, msg: TSMutableString) {
    if (msg.get().includes("dbtest")) {
        DatabaseTests(player);
        return;
    }
    if (msg.get().includes("assert")) {
        assert();
        return;
    }
}

export function HousingCore(events: TSEventHandlers) {
    events.World.OnConfigLoad((reload)=>{LoadSpellTable(reload);});
    events.Spells.OnCast((spell)=>{onCast(spell);}); // forward any spell to onCast
    events.GameObjects.OnCreate((obj,c)=>{onGameObjectCreate(obj, c)});
    events.Player.OnSay((player, msgType, lang, msg) => {onHousingCommand(player, msgType, lang, msg);});
    events.World.OnConfigLoad((reload)=>{LoadHousingObjects(reload);});
    events.Maps.OnGameObjectCreate((map,obj,c)=>{ConfirmHousingSystem(map)});
    events.Player.OnSay((player, msgType, lang, msg) => {onDatabaseCommand(player, msgType, lang, msg);});
}