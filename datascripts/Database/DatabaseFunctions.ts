import { CHARDB } from "./DatabaseSetup";

// general database function library

/* ---------------------------------
 * Utility Functions for Raw Queries
 * ---------------------------------
*/

//TODO: #11 replace most DatabaseFunctions' names and stuff with CharDatabase, those functions do nothing outside of it

export function stringFromSql(s: string) : string { // only used when we gotta take stuff back idk why I'm obsessed with this
    return s.replace(/zzzz/g, '\\');
}

export function stringToSql(s: string) : string {
    return s.replace(/\\/g, 'zzzz');
}

// TODO: #14 create a new function for most/all SQL values based on the snippet below
/*
let lambimia: object[] = CHARDB.read(getid);
    lambimia = lambimia as [];
    if (undefined !== lambimia && lambimia.length){
        let internalid: number = -98;
        if ((lambimia as unknown as object[]).length) {
            lambimia = lambimia as any;
            if (lambimia.length >= 1) internalid = Object.values((lambimia[0] as object)) as unknown as number; else internalid = -99;
        }
*/

/**
 * 
 * @param s {string} string without '
 * @returns {string} 'string' with ' at its sides
 */
export function SqlStr(s: string) : string {
    return '\'' + s + '\'';
}

/**
 * 
 * @param s {string[]} string array
 * @returns {string[]} string array with SqlStr() applied
 */
export function ArgsSqlStr(s: string[]) : string[] {
    for (let x = 0; x < s.length; x++) {
        s[x] = SqlStr(s[x]);
    }
    return s;
}

/**
 * Don't forget to use stringFrom/ToSql() before if using this for anything that has \ involved
 * @param what {string} SELECT what ...
 * @param from {string} ... FROM from ...
 * @param where {string} ... WHERE where ...
 * @param to {string} ... = to!
*/
export function Q_is_equal(what: string, from: string, where: string, to: string) : boolean {
    let query:string = "SELECT " + what + " FROM " + from + " WHERE " + where + " = " + '\'' + to + '\'' + ";";
    if (CHARDB.read(query)) return true;
    return false;
}

/**
 * Don't forget to use stringFrom/ToSql() before if using this for anything that has \ involved
 * @param what {string} SELECT what ...
 * @param from {string} ... FROM from ...
 * @param where {string} ... WHERE where ...
 * @param to {string} ... LIKE to!
*/
export function Q_is_similar(what: string, from: string, where: string, to: string) : boolean {
    let query:string = "SELECT " + what + " FROM " + from + " WHERE " + where + " LIKE " + '\'%' + to + '%\'' + ";";
    if (CHARDB.read(query)) return true;
    return false;
}

/**
 * Don't forget to use stringFrom/ToSql() before if using this for anything that has \ involved, 
 * @param what {number} ... WHERE where = what... // for strings use Q_exists_string()
 * @param from {string} ... FROM from ...
 * @param where {string} ... WHERE where = what...
*/
export function Q_exists(what: number, from: string, where: string) : boolean {
    let query:string = "SELECT " + '*' + " FROM " + from + " WHERE " + what + " = " + where + ";";
    if ((CHARDB.read(query).length < 1)) return false;
    return true;
}

/**
 * Don't forget to use stringFrom/ToSql() before if using this for anything that has \ involved
 * @param what {string} ... WHERE what = what ...
 * @param from {string} ... FROM from ...
 * @param where {string} ... WHERE where = what...
*/
export function Q_exists_string(what: string, from: string, where: string) : boolean {
    let query:string = "SELECT " + '*' + " FROM " + from + " WHERE " + what + " = " + '\'' + where + '\'' + ";";
    if ((CHARDB.read(query).length < 1)) return false;
    return true;
}