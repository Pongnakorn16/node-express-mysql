import mysql from "mysql";
import util from "util";

export const conn = mysql.createPool(
    {
        connectionLimit : 10,
        host : "202.28.34.197",
        user : "tripbooking",
        password : "tripbooking@csmsu",
        database : "tripbooking"
    }
)

export const queryAsync = util.promisify(conn.query).bind(conn);