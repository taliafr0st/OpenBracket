const mysql = require('mysql');

//Setup connection
export const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'openbracket2022',
});

//Open connection
db.connect(function(err) {
    if (err) throw err; //DATABASE ERROR
    console.log('Database connected!');
})

