import sjcl from 'sjcl';
import { Team } from './team.js';
import { db } from '../db/dbconn.js';

/*
Reference: https://stackoverflow.com/a/27612338
Published: 12/23/2014 - https://stackoverflow.com/users/4386702/halbgut
Retrieved: 12/30/2022
*/
function createRandomString (length, callback) {
    var randomBase64String = '',
    checkReadyness;
  
    checkReadyness = setInterval( function () {
        console.log(length);
        if(sjcl.random.isReady(10)) {
            while(randomBase64String.length < length) {
                randomInt = sjcl.random.randomWords(1, 10)[0];
                randomBase64String += btoa(randomInt);
            }
            randomBase64String = randomBase64String.substring(0, length);
            callback(randomBase64String);
            clearInterval(checkReadyness);
        }
    }, 1);
}

export class UserTable {
    constructor() {

    }
    getUserById(id) {

    }
}

export class User {
    constructor(name, email, password, discord=null, twitter=null, twofa=false, callback) {
        this.id; this.name; this.email; this.password; this.twofa;
        
        var sql = `INSERT INTO Participants () VALUES ();`

        db.query(sql, function(error, result, fields) {

            if (error) {
                return callback(null,`${error.sqlMessage}`);
            }
                
            this.id = result.insertId;

            this.name=name;
            this.email=email;
    
            const myBitArray = sjcl.hash.sha256.hash(password);
            const myHash = sjcl.codec.hex.fromBits(myBitArray);
    
            this.password=myHash;
            if(discord) { this.discord=discord }
            if(twitter) { this.twitter=twitter }
            if(twofa) {
                createRandomString(15, function(response) {
                    this.twofa=response;

                    var sqlfields = `INSERT INTO Users (ID, Name, Email, Password`
                    var sqlvalues = `VALUES (${mysql.escape(this.id)}, ${mysql.escape(this.name)}, ${mysql.escape(this.email)}, ${mysql.escape(this.password)}`

                    if(this.discord) {sqlfields += `,Discord`; sqlvalues += `, ${mysql.escape(this.discord)}`}
                    if(this.twitter) {sqlfields += `,Twitter`; sqlvalues += `, ${mysql.escape(this.twitter)}`}
                    if(this.twofa) {sqlfields += `,TwoFA`; sqlvalues += `, ${mysql.escape(this.twofa)}`}

                    sqlfields += `) `;
                    sqlvalues += `)`;

                    var sql = sqlfields+sqlvalues

                    db.query(sql, function(error, result, fields) {

                        if (error) {
                            return callback(null,`${error.sqlMessage}`);
                        }

                        return callback(this, null);
                    });
                });
            }
        });
    }

    createTeam(name, twitter=null) {
        return new Team(name, twitter);
    }

    addUserAsAdmin(user, event) {

    }
}
