import mysql = require('mysql2/promise');

//Setup connection
export const db : Promise<mysql.Connection>
 = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'openbracket2022',
}).then(conn => {
    console.log('Database connected!');
    return conn
}).catch(err => {
    throw err;
});