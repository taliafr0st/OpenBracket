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
    getUserById(id, callback) {
        var sql = `SELECT * FROM Users WHERE ID = ${db.escape(id)};`

        db.query(sql, function(error, result, fields) {

            if (error) {
                return callback(null,`${error.sqlMessage}`);
            }

            new User(result[0].ID,
            result[0].Name,
            result[0].Email,
            result[0].Password,
            result[0].Discord,
            result[0].Twitter,
            result[0].TwoFA,
            function(response) {
                return callback(response, null)
            });
        });
    }
}

export class User {
    constructor(id=null, name, email, password, discord=null, twitter=null, twofa=false, callback) {
        this.id; this.name; this.email; this.password; this.discord; this.twitter; this.twofa;
        
        this.name=name;
        this.email=email;

        const myBitArray = sjcl.hash.sha256.hash(password);
        const myHash = sjcl.codec.hex.fromBits(myBitArray);

        this.password=myHash;
        if(discord) { this.discord=discord }
        if(twitter) { this.twitter=twitter }
        if (id) {
            this.id=id
            if (twofa) {
                this.twofa=twofa
            }
            return callback(this, null);
        }
        var sql = `INSERT INTO Participants () VALUES ();`

        db.query(sql, function(error, result, fields) {

            if (error) {
                return callback(null,`${error.sqlMessage}`);
            }
                
            this.id = result.insertId;

            if(twofa) {
                createRandomString(15, function(response) {
                    this.twofa=response;

                    var sqlfields = `INSERT INTO Users (ID, Name, Email, Password`
                    var sqlvalues = `VALUES (${db.escape(this.id)}, ${db.escape(this.name)}, ${db.escape(this.email)}, ${db.escape(this.password)}`

                    if(this.discord) {sqlfields += `,Discord`; sqlvalues += `, ${db.escape(this.discord)}`}
                    if(this.twitter) {sqlfields += `,Twitter`; sqlvalues += `, ${db.escape(this.twitter)}`}
                    if(this.twofa) {sqlfields += `,TwoFA`; sqlvalues += `, ${db.escape(this.twofa)}`}

                    sqlfields += `) `;
                    sqlvalues += `);`;

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

    toString() {
        return `"${this.name}" (id: ${this.id})`
    }

    createTeam(name, twitter=null, callback) {
        return callback(new Team(name, this, twitter, callback));
    }

    createEvent(name, twitter=null, callback) {
        return callback(new Event(name, this, org, callback));
    }

    addUserAsAdmin(user, event, callback) {
        if (this.id === event.ownerid && user.id != this.id) {

            var sql = `INSERT INTO EventAdmins (EventID, AdminID) VALUES (${db.escape(event.id)},${db.escape(user.id)})`

            db.query(sql, function(error, result, fields) {

                if (error) {
                    return callback(`${error.sqlMessage}`);
                }

                return callback(null);

            });

        } else {
            callback(`${this.toString()} does not own event ${event.toString()}`)
        }
    }
}
