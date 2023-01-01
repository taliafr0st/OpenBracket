import sjcl from 'sjcl';
import { Team } from './team.js';
import { db } from '../db/dbconn.js';

/*
Reference: https://stackoverflow.com/a/27612338
Published: 12/23/2014 - https://stackoverflow.com/users/4386702/halbgut
Retrieved: 12/30/2022
*/
function createRandomString (callback, length) {
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

export const UserTable = class {
    getUserById(callback, id) {
        new User(function (obj, err) {
            callback(obj, err);
        }, id)
    }
}

export class User {
    id; name; email; password; discord; twitter; twofa;
    constructor(callback, id=null, name=null, email=null, password=null, discord=null, twitter=null, twofa=false) {
        var sql;
        
        if (id) {
            var sql = `SELECT * FROM Users WHERE ID = ${id};`;

            db.query(sql, function(error, result, fields) {

                if (error) {
                    return callback(null,`${error.sqlMessage}`);
                }
    
                this.id=id;
                this.name=result[0].Name;
                this.email=result[0].Email;
                this.#password=result[0].Password;
                if (result[0].Discord) {this.discord=result[0].Discord}
                if (result[0].Twitter) {this.twitter=result[0].Twitter}
                if (result[0].TwoFA) {this.twofa=result[0].TwoFA}

                return callback(this, null);
            });
        }

        const myBitArray = sjcl.hash.sha256.hash(password);
        const myHash = sjcl.codec.hex.fromBits(myBitArray);

        var sqlfields = `INSERT INTO Users (ID, Name, Email, Password`
        var sqlvalues = `VALUES ((SELECT LAST_INSERT_ID()), ${db.escape(name)}, ${db.escape(email)}, ${db.escape(myHash)}`

        if(discord) {
            sqlfields += `, Discord`;
            sqlvalues += `, ${db.escape(discord)}`;
        }
        if(twitter) {
            sqlfields += `, Twitter`;
            sqlvalues += `, ${db.escape(twitter)}`;
        }

        if(twofa) {
            createRandomString(function(response) {

                sqlfields += `, TwoFA) `;
                sqlvalues += `, ${db.escape(response)});`;

                sql = `START TRANSACTION; INSERT INTO Participants () VALUES (); `+sqlfields+sqlvalues+` COMMIT;`

                db.query(sql, function(error, result, fields) {

                    if (error) {
                        return callback(null,`${error.sqlMessage}`);
                    }

                    this.id=result.insertId;

                    this.name=name;
                    this.email=email;

                    this.password=myHash;
                    if(discord) { this.discord=discord }
                    if(twitter) { this.twitter=twitter }
                    
                    this.twofa=response;

                    return callback(this, null);
                });
            }, 15);
        }

        sqlfields += `) `;
        sqlvalues += `);`;

        sql = `START TRANSACTION; INSERT INTO Participants () VALUES (); `+sqlfields+sqlvalues+` COMMIT;`

        db.query(sql, function(error, result, fields) {

            if (error) {
                return callback(null,`${error.sqlMessage}`);
            }

            this.id=tempId;

            this.name=name;
            this.email=email;

            this.password=myHash;
            if(discord) { this.discord=discord }
            if(twitter) { this.twitter=twitter }

            return callback(this, null);
        });
    }

    toString() {
        return `"${this.name}" (id: ${this.id})`;
    }

    updateInfo(callback, name=null, email=null, discord=null, twitter=null) {
        
        var sql = `UPDATE Users SET `

        if(name) {sql += `Name=${db.escape(name)}, `}
        if(email) {sql += `Email=${db.escape(email)}, `}
        if(discord) {sql += `Discord=${db.escape(discord)}, `}
        if(twitter) {sql += `Twitter=${db.escape(twitter)}, `}

        if (sql===`UPDATE Users SET `) {
            return callback(null);
        }

        sql = sql.substring(0,length(sql)-2)+` WHERE ID=${this.id});`;

        db.query(sql, function(error, result, fields) {

            if (error) {
                return callback(`${error.sqlMessage}`);
            }
            if (name) {this.name=name}
            if (email) {this.email=email}
            if (discord) {this.discord=discord}
            if (twitter) {this.twitter=twitter}
            return callback(null);

        });
    }

    changePassword(callback, oldpassword, newpassword, confirmpassword) {
        if (oldpassword === newpassword) {
            return callback(`Old and new passwords are the same`);
        } else if (!(newpassword === confirmpassword)) {
            return callback(`New passwords are different`);
        }

        const oldBitArray = sjcl.hash.sha256.hash(oldpassword);
        const oldHash = sjcl.codec.hex.fromBits(oldBitArray);

        if (!(oldHash === this.password)) {
            return callback(`Incorrect password`);
        }

        const newBitArray = sjcl.hash.sha256.hash(newpassword);
        const newHash = sjcl.codec.hex.fromBits(newBitArray);

        var sql = `Update Users SET Password=${newHash} WHERE ID=${this.id};`

        db.query(sql, function(error, result, fields) {

            if (error) {
                return callback(`${error.sqlMessage}`);
            }
            this.password = newHash;
            return callback(null);

        });
    }

    toggleTwoFA(callback,twofa) {
        if (this.twofa && twofa) {
            return callback(`2FA is already activated`)
        } else if (!(this.twofa || twofa)) {
            return callback(`2FA is already off`)
        }

        if (this.twofa) {

            var sql = `UPDATE Users SET TwoFA=NULL WHERE ID=${this.id}`

            db.query(sql, function(error, result, fields) {

                if (error) {
                    return callback(`${error.sqlMessage}`);
                }
                this.twofa=undefined;
                return callback(null);
    
            });
        }

        createRandomString(function(response) {

            var sql = `UPDATE Users SET TwoFA=${response} WHERE ID=${this.id}`

            db.query(sql, function(error, result, fields) {

                if (error) {
                    return callback(`${error.sqlMessage}`);
                }
                this.twofa=response;
                return callback(null);
    
            });

        }, 15);

    }

    delete(callback) {

        var sql = `DELETE FROM Users WHERE ID=${this.id};`

        db.query(sql, function(error, result, fields) {

            if (error) {
                return callback(`${error.sqlMessage}`);
            }

            this.id=null;
            return callback(null);

        });
    }

    // addUserAsAdmin(user, event, callback) {
    //     if (this.id === event.ownerid && user.id != this.id) {

    //         var sql = `INSERT INTO EventAdmins (EventID, AdminID) VALUES (${db.escape(event.id)},${db.escape(user.id)})`

    //         db.query(sql, function(error, result, fields) {

    //             if (error) {
    //                 return callback(`${error.sqlMessage}`);
    //             }

    //             return callback(null);

    //         });

    //     } else {
    //         callback(`${this.toString()} does not own event ${event.toString()}`)
    //     }
    // }
}
