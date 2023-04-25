import { db } from './db/dbconn.js';
import * as fs from 'fs';

var sql : string = `SELECT SCHEMA_NAME
    FROM INFORMATION_SCHEMA.SCHEMATA
    WHERE SCHEMA_NAME = 'openbracket';`;

db.then( db => {
    db.query(sql)
    .then( result => {
        if (!(result[0])) {
    
            console.log(`OpenBracket database not detected, creating OpenBracket database`)

            fs.readFile('./schema.sql', function(error, buffer) {

                sql = `START TRANSACTION; CREATE DATABASE OpenBracket; USE OpenBracket;\n`+buffer.toString()+`COMMIT;`;

                db.query(sql)
                .catch( error => {
                    console.log(`Startup failed: ${error.sqlMessage}`)
                });
            });
        } else {

            console.log(`Existing OpenBracket database detected`)

            sql = `USE OpenBracket;`

            db.query(sql)
            .catch( error => {
                console.log(`Startup failed: ${error.sqlMessage}`)
            });
        }
    })
    .catch( error => {
        console.log(`Startup failed: ${error.sqlMessage}`)
    })
});

console.log(`OpenBracket instance ready`)