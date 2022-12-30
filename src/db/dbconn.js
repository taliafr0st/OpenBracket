import mysql from 'mysql';

//Setup connection
export const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'openbracket2022',
    database: 'openbracket'
});

//Open connection
db.connect(function(err) {
    if (err) throw err; //DATABASE ERROR
    console.log('Database connected!');
})