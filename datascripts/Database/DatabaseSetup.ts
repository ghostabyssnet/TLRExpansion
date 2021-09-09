import { SQL } from "wotlkdata";

const DB_INFO = 'TODO: #1 make database login info customizable in here (see CHARDB below)';

/* -----------------------------------------------------
 * THIS WILL BE RAN WHEN YOU'RE INSTALLING, DON'T BOTHER
 * If something breaks and you've lost hope, set the
 * variable below to TRUE to recreate this module's
 * entire database. Please contact us, this is not right
 * -----------------------------------------------------
*/

/**
 * If true, this custom database gets reset on startup
 */
const SHOULD_RECREATE: boolean = true;

// might as well use this while you're at it, if you know what you're doing

const DEBUG: boolean = false;

/* ------------------------------
 * Database Variables and Queries
 * ------------------------------
*/

// hsid = house ID
// guid = player, owner

// TODO: try to get rid of Mirrors after "onPreSpellCast()" drops in next tswow update
// TODO: #9 change this for release (even if alpha) when housing works (remove gm_ prefix)

// const db_gameobject_base: string = 'gm_go_base'; -> DEPRECATED, TODO: remove (if stuff works fine)
// export const db_gameobject_mirror: string = 'gm_go_mirror'; // possibly remove this when new tswow patch drops
export const db_gameobject_template: string = 'gm_go_template';

//spellitem database: defines spells and items after the template has been made
export const db_gameobject_spellitem: string = 'gm_go_spellitem';

export const db_world_houselist: string = 'gm_world_houselist';
export const db_world_garrisonlist: string = 'gm_world_garrisonlist';
export const db_character_houses: string = 'gm_char_hs';
export const db_character_gameobjects: string = 'gm_char_go';
export const db_character_dummies: string = 'gm_char_dm';
export const db_guild_houses: string = 'gm_guild_hs';
export const db_guild_gameobjects: string = 'gm_guild_go';
export const db_guild_dummies: string = 'gm_guild_dm';

// create list of houses
const Q_world_createhousestable: string = 'CREATE TABLE IF NOT EXISTS ' + db_world_houselist + '(hsid int(10) unsigned NOT NULL UNIQUE PRIMARY KEY,zoneid int(10) unsigned NOT NULL,phase tinyint NOT NULL default 1);';

// create list of garrisons
const Q_world_creategarrisonstable : string = 'CREATE TABLE IF NOT EXISTS ' + db_world_garrisonlist + '(hsid int(10) unsigned NOT NULL UNIQUE PRIMARY KEY,zoneid int(10) unsigned NOT NULL,phase tinyint NOT NULL default 1);';

// create character <-> house relationship
const Q_char_createhstable: string = 'CREATE TABLE IF NOT EXISTS ' + db_character_houses + '(guid int(10) unsigned NOT NULL UNIQUE PRIMARY KEY,hsid int(10) unsigned UNIQUE,FOREIGN KEY(guid) REFERENCES characters(guid));'; 

// create placed gameobject table
const Q_char_creategotable: string = 'CREATE TABLE IF NOT EXISTS ' + db_character_gameobjects + '(guid int(10) unsigned NOT NULL UNIQUE PRIMARY KEY,templateId int(10) NOT NULL,instanceId int(10) NOT NULL,map smallint NOT NULL,locx double(5,5) NOT NULL,locy double(5,5) NOT NULL,locz double(5,5) NOT NULL,loco double(5,5) NOT NULL,FOREIGN KEY(guid) REFERENCES characters(guid));'; 

// create dummy (the creatures we use to handle our gameobjects, rotating and stuff) table
const Q_char_createdmtable: string = 'CREATE TABLE IF NOT EXISTS ' + db_character_dummies + '(guid int(10) unsigned NOT NULL UNIQUE PRIMARY KEY,instanceId int(10) NOT NULL,map smallint NOT NULL,locx double(5,5) NOT NULL,locy double(5,5) NOT NULL,locz double(5,5) NOT NULL,loco double(5,5) NOT NULL,FOREIGN KEY(guid) REFERENCES characters(guid));'; 

// create guild <-> garrison relationship
const Q_guild_createhstable: string = 'CREATE TABLE IF NOT EXISTS ' + db_guild_houses + '(guildid int(10) unsigned NOT NULL UNIQUE PRIMARY KEY,hsid int(10) unsigned UNIQUE,FOREIGN KEY(guildid) REFERENCES guild(guildid));';

// create garrison placed gameobject table
const Q_guild_creategotable: string = 'CREATE TABLE IF NOT EXISTS ' + db_guild_gameobjects + '(guildid int(10) unsigned NOT NULL UNIQUE PRIMARY KEY,templateId int(10) NOT NULL,instanceId int(10) NOT NULL,map smallint NOT NULL,locx double(5,5) NOT NULL,locy double(5,5) NOT NULL,locz double(5,5) NOT NULL,loco double(5,5) NOT NULL,FOREIGN KEY(guildid) REFERENCES guild(guildid));'; 

// create garrison dummy table
const Q_guild_createdmtable: string = 'CREATE TABLE IF NOT EXISTS ' + db_guild_dummies + '(guildid int(10) unsigned NOT NULL UNIQUE PRIMARY KEY,instanceId int(10) NOT NULL,map smallint NOT NULL,locx double(5,5) NOT NULL,locy double(5,5) NOT NULL,locz double(5,5) NOT NULL,loco double(5,5) NOT NULL,FOREIGN KEY(guildid) REFERENCES guild(guildid));'; 

// create gameobject template list table
const Q_go_creategotable: string = 'CREATE TABLE IF NOT EXISTS ' + db_gameobject_template + '(internalid int(10) unsigned NOT NULL UNIQUE PRIMARY KEY AUTO_INCREMENT,entry int(10) unsigned NOT NULL UNIQUE,id varchar(255) UNIQUE NOT NULL,displayid int(10) unsigned NOT NULL UNIQUE,icon varchar(255) NOT NULL,name varchar(255) NOT NULL,rarity tinyint NOT NULL,type tinyint NOT NULL default 5);';

const Q_go_createspellitemtable: string = 'CREATE TABLE IF NOT EXISTS ' + db_gameobject_spellitem + '(internalid int(10) unsigned NOT NULL UNIQUE PRIMARY KEY,entry int(10) unsigned NOT NULL UNIQUE,spellid int(10) unsigned NOT NULL UNIQUE,itemid int(10) unsigned NOT NULL UNIQUE, FOREIGN KEY(internalid) REFERENCES ' + db_gameobject_template + '(internalid)' + ',FOREIGN KEY(entry) REFERENCES ' + db_gameobject_template + '(entry)' + ');';

// create mirror dummies that shouldn't be spawned (only for item viewing purposes) table
// note: id is not foreign key because we want it to be different than what it mirrors
// TODO: #13 remove this shit if mirrors aren't needed
// const Q_go_createmirrortable: string = 'CREATE TABLE IF NOT EXISTS ' + db_gameobject_mirror + '(internalid int(10) unsigned NOT NULL UNIQUE PRIMARY KEY,entry int(10) unsigned NOT NULL UNIQUE,id varchar(255) UNIQUE NOT NULL,name varchar(255) NOT NULL,type tinyint NOT NULL default 5,FOREIGN KEY(internalid) REFERENCES ' + db_gameobject_template + '(internalid), FOREIGN KEY(entry) REFERENCES ' + db_gameobject_template + '(entry));';

/* -----------------
 * Database Creation
 * -----------------
*/

export const CHARDB = SQL.Databases.connect({
    database: 'tswow_characters_tswow',
    host: 'localhost',
    user: 'root',
    password: '',
    port: '3306'
});

/*
 * DB.read() is used instead of DB.write() below because it's synchronous (write() is async)
*/
function ResetDatabase() {
    if (!SHOULD_RECREATE) return;
    else {
        console.log("[TLRExpansion] RECREATING DATABASE...");
        // TODO: add a check and make below code work properly
        // (yes, programmers, I know it's ugly)
        CHARDB.read('ALTER TABLE ' + db_gameobject_template + ';');
        CHARDB.read('ALTER TABLE ' + db_gameobject_spellitem + ' DROP FOREIGN KEY ' + db_gameobject_spellitem + '_ibfk_1;');
        CHARDB.read('ALTER TABLE ' + db_gameobject_spellitem + ' DROP FOREIGN KEY ' + db_gameobject_spellitem + '_ibfk_2;');
        CHARDB.read('ALTER TABLE ' + db_character_houses + ' DROP FOREIGN KEY gm_char_hs_ibfk_1;');
//        CHARDB.read('ALTER TABLE ' + 'gm_go_mirror' + ' DROP FOREIGN KEY gm_go_mirror_ibfk_1, DROP FOREIGN KEY gm_go_mirror_ibfk_2;');
        CHARDB.read('ALTER TABLE ' + db_character_gameobjects + ' DROP FOREIGN KEY gm_char_go_ibfk_1;');
        CHARDB.read('ALTER TABLE ' + db_character_dummies + ' DROP FOREIGN KEY gm_char_dm_ibfk_1;');
        CHARDB.read('ALTER TABLE ' + db_guild_houses + ' DROP FOREIGN KEY gm_guild_hs_ibfk_1;');
        CHARDB.read('ALTER TABLE ' + db_guild_gameobjects + ' DROP FOREIGN KEY gm_guild_go_ibfk_1;');
        CHARDB.read('ALTER TABLE ' + db_guild_dummies + ' DROP FOREIGN KEY gm_guild_dm_ibfk_1;');
        CHARDB.read('DROP TABLE IF EXISTS ' + db_gameobject_template + ';');
        CHARDB.read('DROP TABLE IF EXISTS ' + db_gameobject_spellitem + ';');
//        CHARDB.read('DROP TABLE IF EXISTS ' + 'gm_go_mirror' + ';');
        CHARDB.read('DROP TABLE IF EXISTS ' + db_world_houselist + ';');
        CHARDB.read('DROP TABLE IF EXISTS ' + db_world_garrisonlist + ';');
        CHARDB.read('DROP TABLE IF EXISTS ' + db_character_houses + ';');
        CHARDB.read('DROP TABLE IF EXISTS ' + db_character_gameobjects + ';');
        CHARDB.read('DROP TABLE IF EXISTS ' + db_character_dummies + ';');
        CHARDB.read('DROP TABLE IF EXISTS ' + db_guild_houses + ';');
        CHARDB.read('DROP TABLE IF EXISTS ' + db_guild_gameobjects + ';');
        CHARDB.read('DROP TABLE IF EXISTS ' + db_guild_dummies + ';');
        HandleDatabase(); // tryna make it synchronous
    }
}

if (SHOULD_RECREATE) ResetDatabase();

function QuickCheck(s: string) : string {
    return 'SELECT * FROM ' + s + ';';
}

function QuickDebug(s: string) : any {
    let x = CHARDB.read(QuickCheck(s));
    if(DEBUG) {
        if (x) return x; else return null;
    }
    else {
        if (x) return 'Table [' + s + '] loaded successfully.'; else return null;
    }
}

function HandleDatabase() {
    console.log("[TLRExpansion] Handling database...");
    CHARDB.read(Q_world_createhousestable);
    if (QuickDebug(db_world_houselist)) console.log(QuickDebug(db_world_houselist)); else console.log(db_world_houselist + ' failed!');
    CHARDB.read(Q_world_creategarrisonstable);
    if (QuickDebug(db_world_garrisonlist)) console.log(QuickDebug(db_world_garrisonlist)); else console.log(db_world_garrisonlist + ' failed!');
    CHARDB.read(Q_char_createhstable);
    if (QuickDebug(db_character_houses)) console.log(QuickDebug(db_character_houses)); else console.log(db_character_houses + ' failed!');
    CHARDB.read(Q_char_creategotable);
    if (QuickDebug(db_character_gameobjects)) console.log(QuickDebug(db_character_gameobjects)); else console.log(db_character_gameobjects + ' failed!');
    CHARDB.read(Q_char_createdmtable);
    if (QuickDebug(db_character_dummies)) console.log(QuickDebug(db_character_dummies)); else console.log(db_character_dummies + ' failed!');
    CHARDB.read(Q_guild_createhstable);
    if (QuickDebug(db_guild_houses)) console.log(QuickDebug(db_guild_houses)); else console.log(db_guild_houses + ' failed!');
    CHARDB.read(Q_guild_creategotable);
    if (QuickDebug(db_guild_gameobjects)) console.log(QuickDebug(db_guild_gameobjects)); else console.log(db_guild_gameobjects + ' failed!');
    CHARDB.read(Q_guild_createdmtable);
    if (QuickDebug(db_guild_dummies)) console.log(QuickDebug(db_guild_dummies)); else console.log(db_guild_dummies + ' failed!');
    CHARDB.read(Q_go_creategotable);
    if (QuickDebug(db_gameobject_template)) console.log(QuickDebug(db_gameobject_template)); else console.log(db_gameobject_template + ' failed!');
    CHARDB.read(Q_go_createspellitemtable);
    if (QuickDebug(db_gameobject_spellitem)) console.log(QuickDebug(db_gameobject_spellitem)); else console.log(db_gameobject_spellitem + ' failed!');        
//    CHARDB.read(Q_go_createmirrortable);
//    if (QuickDebug(db_gameobject_mirror)) console.log(QuickDebug(db_gameobject_mirror)); else console.log(db_gameobject_mirror + ' failed!');
}

if (!SHOULD_RECREATE) HandleDatabase();
/*
 * TODO: #10 remove this when I'm sure stuff won't break
*/
/*let xd = [];
let cs0 = CHARDB.read('SHOW CREATE TABLE ' + db_world_houselist);
xd[0] = cs0;
let cs1 = CHARDB.read('SHOW CREATE TABLE ' + db_world_garrisonlist);
xd[1] = cs1;
let cs2 = CHARDB.read('SHOW CREATE TABLE ' + db_gameobject_mirror);
xd[2] = cs2;
let cs3 = CHARDB.read('SHOW CREATE TABLE ' + db_character_houses);
xd[3] = cs3;
let cs4 = CHARDB.read('SHOW CREATE TABLE ' + db_character_gameobjects);
xd[4] = cs4;
let cs5 = CHARDB.read('SHOW CREATE TABLE ' + db_character_dummies);
xd[5] = cs5;
let cs6 = CHARDB.read('SHOW CREATE TABLE ' + db_guild_houses);
xd[6] = cs6;
let cs7 = CHARDB.read('SHOW CREATE TABLE ' + db_guild_gameobjects);
xd[7] = cs7;
let cs8 = CHARDB.read('SHOW CREATE TABLE ' + db_guild_dummies);
xd[8] = cs8;
let cs9 = CHARDB.read('SHOW CREATE TABLE ' + db_gameobject_template);
xd[9] = cs9;
console.log(xd);*/