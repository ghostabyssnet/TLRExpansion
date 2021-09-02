import Query from "mysql2/typings/mysql/lib/protocol/sequences/Query";
import { SQL } from "wotlkdata";

const DEBUG = true; // enable/disable verbose
const DEBUG_NAME = "TLRE/Database/DatabaseSetup: ";
const DB_INFO = 'TODO: make database login info customizable in here (see CHARDB below)'; // TODO

/* ------------------------------
 * Database Variables and Queries
 * ------------------------------
*/

// hsid = house ID
// guid = player, owner

// create list of houses
const Q_world_createhousestable : string = 'CREATE TABLE IF NOT EXISTS gm_world_houselist(hsid int(10) unsigned NOT NULL UNIQUE PRIMARY KEY,zoneid int(10) unsigned NOT NULL,phase tinyint NOT NULL default 1);';

// create character <-> house relationship
const Q_char_createhstable : string = 'CREATE TABLE IF NOT EXISTS gm_char_hs(guid int(10) unsigned NOT NULL UNIQUE PRIMARY KEY,hsid int(10) unsigned UNIQUE,FOREIGN KEY(guid) REFERENCES characters(guid));'; 

// create gameobject table
const Q_char_creategotable : string = 'CREATE TABLE IF NOT EXISTS gm_char_go(guid int(10) unsigned NOT NULL UNIQUE PRIMARY KEY,templateId int(10) NOT NULL,instanceId int(10) NOT NULL,map smallint NOT NULL,locx double(5,5) NOT NULL,locy double(5,5) NOT NULL,locz double(5,5) NOT NULL,loco double(5,5) NOT NULL,FOREIGN KEY(guid) REFERENCES characters(guid));'; 

// create dummy (the creatures we use to handle our gameobjects, rotating and stuff) table
const Q_char_createdmtable : string = 'CREATE TABLE IF NOT EXISTS gm_char_dm(guid int(10) unsigned NOT NULL UNIQUE PRIMARY KEY,instanceId int(10) NOT NULL,map smallint NOT NULL,locx double(5,5) NOT NULL,locy double(5,5) NOT NULL,locz double(5,5) NOT NULL,loco double(5,5) NOT NULL,FOREIGN KEY(guid) REFERENCES characters(guid));'; 

// create list of garrisons
const Q_world_creategarrisonstable : string = 'CREATE TABLE IF NOT EXISTS gm_world_garrisonlist(hsid int(10) unsigned NOT NULL UNIQUE PRIMARY KEY,zoneid int(10) unsigned NOT NULL,phase tinyint NOT NULL default 1)';

// create guild <-> garrison relationship
const Q_guild_createhstable : string = 'CREATE TABLE IF NOT EXISTS gm_guild_hs(guildid int(10) unsigned NOT NULL UNIQUE PRIMARY KEY,hsid int(10) unsigned UNIQUE,FOREIGN KEY(guildid) REFERENCES guild(guildid))';

// create garrison gameobject table
const Q_guild_creategotable : string = 'CREATE TABLE IF NOT EXISTS gm_guild_go(guildid int(10) unsigned NOT NULL UNIQUE PRIMARY KEY,templateId int(10) NOT NULL,instanceId int(10) NOT NULL,map smallint NOT NULL,locx double(5,5) NOT NULL,locy double(5,5) NOT NULL,locz double(5,5) NOT NULL,loco double(5,5) NOT NULL,FOREIGN KEY(guildid) REFERENCES guild(guildid));'; 

// create garrison dummy table
const Q_guild_createdmtable : string = 'CREATE TABLE IF NOT EXISTS gm_guild_dm(guildid int(10) unsigned NOT NULL UNIQUE PRIMARY KEY,instanceId int(10) NOT NULL,map smallint NOT NULL,locx double(5,5) NOT NULL,locy double(5,5) NOT NULL,locz double(5,5) NOT NULL,loco double(5,5) NOT NULL,FOREIGN KEY(guildid) REFERENCES guild(guildid));'; 

/* -----------------
 * Database Creation
 * -----------------
*/

const CHARDB = SQL.Databases.connect({
    database: 'tswow_characters_tswow',
    host: 'localhost',
    user: 'root',
    password: '',
    port: '3306'
});

// create base databases

CHARDB.write(Q_world_createhousestable);
CHARDB.writeLate(Q_world_creategarrisonstable);
CHARDB.writeLate(Q_char_createhstable);
CHARDB.writeLate(Q_char_creategotable);
CHARDB.writeLate(Q_char_createdmtable);
CHARDB.writeLate(Q_guild_createhstable);
CHARDB.writeLate(Q_guild_creategotable);
CHARDB.writeLate(Q_guild_createdmtable);


