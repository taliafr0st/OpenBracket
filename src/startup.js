import { db } from './db/dbconn.js';
import * as fs from 'fs';

var sql = `SELECT SCHEMA_NAME
    FROM INFORMATION_SCHEMA.SCHEMATA
    WHERE SCHEMA_NAME = 'openbracket';`;

db.query(sql, function(error, result, fields) {
    if (error) {
        console.log(`Startup failed: ${error.sqlMessage}`)
    }
    if (!(result[0])) {

        console.log(`OpenBracket database not detected, creating OpenBracket database`)

        fs.readFile('./schema.sql', function(error, buffer) {

            sql = `START TRANSACTION; CREATE DATABASE OpenBracket; USE OpenBracket;\n`+buffer.toString()+`COMMIT;`;

            db.query(sql, function (error, result, fields) {

                if (error) {
                    console.log(`Startup failed: ${error.sqlMessage}`)
                }

            });
        });
    } else {

        console.log(`Existing OpenBracket database detected`)

        sql = `USE OpenBracket;`

        db.query(sql, function (error, result, fields) {

            if (error) {
                console.log(`Startup failed: ${error.sqlMessage}`)
            }

        });
    }
});

console.log(`OpenBracket instance ready`)