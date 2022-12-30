import mysql from 'mysql';

//Setup connection
const dbConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'openbracket2022',
});

//Open connection
dbConnection.connect(function(err) {
    if (err) throw err; //DATABASE ERROR
    console.log('Database connected!');
})

//Export connection
module.exports = dbConnection;