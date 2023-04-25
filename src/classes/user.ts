import sjcl = require('sjcl');
import { db } from '../db/dbconn.js';
import { RowDataPacket } from "mysql2";

/*
Reference: https://stackoverflow.com/a/27612338
Published: 12/23/2014 - https://stackoverflow.com/users/4386702/halbgut
Retrieved: 12/30/2022
*/
function createRandomString (length : number) : Promise<String> {
    var randomBase64String = '',
    checkReadyness : NodeJS.Timer;
  
    checkReadyness = setInterval( function () {
        console.log(length);
        if(sjcl.random.isReady(10)) {
            while(randomBase64String.length < length) {
                var randomInt : number = sjcl.random.randomWords(1, 10)[0];
                randomBase64String += randomInt.toString(64);
            }
            randomBase64String = randomBase64String.substring(0, length);
            callback(randomBase64String);
            clearInterval(checkReadyness);
        }
    }, 1);
}

function isPasswordSecure(pswd : string) {
    var err = "";
    if (pswd.length < 10) {
        err += "Password is too short\n";
    }
    if (!/0-9/.test(pswd)) {
        err += "Password does not contain any numbers\n";
    }
    if (!/A-Z/.test(pswd)) {
        err += "Password does not contain any upper case letters\n"
    }
    if (!/a-z/.test(pswd)) {
        err += "Password does not contain any lower case letters\n"
    }
    if (!err) {
        return null;
    } else {
        return err.substring(0, length-1);
    }
}

export const UserTable = class {

    public static async getUserById(id : number) : Promise<User> {

        var sql = `SELECT * FROM users WHERE id = ?;`;
        var u = new User();
        var uPromise : Promise<User> = new Promise((resolve, reject) => {
            db.then( db => db.query<User[]>(sql, [id]))
                .then( result => {

                    var rows = result[0];

                    if (rows.length === 1) {

                        u.ID=id;
                        u.username=rows[0].username;
                        u.displayname=rows[0].displayname;
                        u.email=rows[0].email;
                        u.password=rows[0].password;
                        if (rows[0].discord) {u.discord=rows[0].discord}
                        if (rows[0].twitter) {u.twitter=rows[0].twitter}
                        if (rows[0].twofa) {u.twofa=rows[0].twofa}

                        resolve(u);
                    } else if (rows.length > 1) {
                        reject(new Error("Multiple users share this ID"))
                    }
                })
                .catch( error => {
                    reject(error);
                });

        });
        return uPromise;  
    }

    public static async getUserByName(username : string) : Promise<User> {

        var sql = `SELECT * FROM users WHERE username = ?;`;
        var u = new User();
        var uPromise : Promise<User> = new Promise((resolve, reject) => {
            db.then( db => db.query<User[]>(sql, [username]))
                .then( result => {

                    var rows = result[0];

                    u.id=rows[0].id;
                    u.username=username;
                    u.displayname=rows[0].displayname;
                    u.email=rows[0].email;
                    u.password=rows[0].password;
                    if (rows[0].discord) {u.discord=rows[0].discord}
                    if (rows[0].twitter) {u.twitter=rows[0].twitter}
                    if (rows[0].twofa) {u.twofa=rows[0].twofa}

                    resolve(u);
                })
                .catch( error => {
                    reject(error);
                });

        });
        return uPromise;  
    }

    public static async createUser(username : string, displayname : string, email : string, password : string, discord : string, twitter : string, twofa : string) : Promise<User> {

        var passwordStatus = isPasswordSecure(password);

        if (passwordStatus) {
            return callback(null, passwordStatus);
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

                    this.username=username;
                    this.displayname=displayname;
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

            this.username=username;
            this.displayname=displayname;
            this.email=email;

            this.password=myHash;
            if(discord) { this.discord=discord }
            if(twitter) { this.twitter=twitter }

            return callback(this, null);
        });   
    }

}

export interface User extends RowDataPacket {
    id: number;
    username: string;
    displayname: string;
    email: string;
    password: string;
    discord: string;
    twitter: string;
    twofa: string;
}

export class User {

    constructor() {

        this.id=0;
        this.username="";
        this.displayname="";
        this.email="";
        this.password="";
        this.discord="";
        this.twitter="";
        this.twofa="";

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

        var passwordStatus = isPasswordSecure(password);

        if (passwordStatus) {
            return callback(passwordStatus);
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

    comparePassword(password) {

        const bitArray = sjcl.hash.sha256.hash(password);
        const hash = sjcl.codec.hex.fromBits(bitArray);

        if (!(this.password === hash)) {
            return "Incorrect password";
        }
        return null;

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