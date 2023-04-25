import sjcl = require('sjcl');
import { db } from '../db/dbconn.js';
import { OkPacket, RowDataPacket } from "mysql2";

/*
Reference: https://stackoverflow.com/a/27612338
Published: 12/23/2014 - https://stackoverflow.com/users/4386702/halbgut
Retrieved: 12/30/2022
*/
function createRandomString (length : number) : Promise<String> {
    var randomBase64String = '';
    var checkReadyness : NodeJS.Timer;
    var c : number = 0;

    var stringPromise : Promise<String> = new Promise((resolve, reject) => {
        checkReadyness = setInterval( function () {
            console.log(length);
            c++;
            if(sjcl.random.isReady(10)) {
                while(randomBase64String.length < length) {
                    var randomInt : number = sjcl.random.randomWords(1, 10)[0];
                    randomBase64String += randomInt.toString(64);
                }
                randomBase64String = randomBase64String.substring(0, length);
                resolve(randomBase64String);
                clearInterval(checkReadyness);
            } else if (c > 50) {
                clearInterval(checkReadyness);
            }
        }, 1)
        reject(new Error("Could not generate a random string"));
    });
    return stringPromise;
}

function isPasswordSecure(pswd : string) : Promise<number> {
    var err : Promise<number> = new Promise((resolve, reject) => {
    var errmsg = "";
    if (pswd.length < 10) {
        errmsg += "Password is too short\n";
    }
    if (!/0-9/.test(pswd)) {
        errmsg += "Password does not contain any numbers\n";
    }
    if (!/A-Z/.test(pswd)) {
        errmsg += "Password does not contain any upper case letters\n"
    }
    if (!/a-z/.test(pswd)) {
        errmsg += "Password does not contain any lower case letters\n"
    }
    if (!errmsg) {
        resolve(0);
    } else {
        reject(new Error(errmsg.substring(0, errmsg.length-1)));
    }
    });
    return err;
}

export const UserTable = class {

    public static async getUserById(id : number) : Promise<User> {

        var sql = `SELECT * FROM users WHERE id = ?;`;
        var uPromise : Promise<User> = new Promise((resolve, reject) => {
            var u = new User();
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
        var uPromise : Promise<User> = new Promise((resolve, reject) => {
            var u = new User();
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

        var sql : string;

        var uPromise : Promise<User> = new Promise(async (resolve, reject) => {
            var u = new User();
            var passwordStatus = isPasswordSecure(password);

            if (passwordStatus) {
                reject(passwordStatus);
            }

            const myBitArray = sjcl.hash.sha256.hash(password);
            const myHash = sjcl.codec.hex.fromBits(myBitArray);

            var sqlfields = `INSERT INTO users (id, name, email, password`
            var sqlvalues = `VALUES ((SELECT LAST_INSERT_ID()), ?, ?, ?`
            var attrs : string[] = [username, email, myHash]
            

            if(discord) {
                sqlfields += `, discord`;
                sqlvalues += `, ?`;
                attrs.push(discord)
            }
            if(twitter) {
                sqlfields += `, twitter`;
                sqlvalues += `, ?`;
                attrs.push(twitter)
            }

            if(twofa) {
                await createRandomString(15).then( twofacode => {

                    sqlfields += `, twofa) `;
                    sqlvalues += `, ?);`;

                    attrs.push(twofa)

                });
            } else {
                sqlfields += `) `;
                sqlvalues += `);`;
            }

            sql = `START TRANSACTION; INSERT INTO participants () VALUES (); `+sqlfields+sqlvalues+` COMMIT;`

            db.then( db => {db.query<OkPacket>(sql, attrs)
                .then( result => {
                    u.id=result[0].insertId;

                    u.username=username;
                    u.displayname=displayname;
                    u.email=email;
    
                    u.password=myHash;
                    if(discord) { u.discord=discord }
                    if(twitter) { u.twitter=twitter }
                    if(twofa) { u.twofa=attrs.pop() }
                    resolve(u)
                }) 
                .catch( error => {
                    reject(error)
                });
            });
        });
    return uPromise;
    }

}

export interface User extends RowDataPacket {
    id: number;
    username: string;
    displayname: string;
    email: string;
    password: string;
    discord: string | undefined;
    twitter: string | undefined;
    twofa: string | undefined;
}

export class User {

    constructor() {

        this.id=0;
        this.username="";
        this.displayname="";
        this.email="";
        this.password="";
        // this.discord="";
        // this.twitter="";
        // this.twofa="";

    }

    toString() {
        return `"${this.name}" (id: ${this.id})`;
    }

    updateInfo(name : string, email : string, discord : string, twitter : string) : Promise<number> {
        
        var err : Promise<number> = new Promise((resolve, reject) => {
            var sql = `UPDATE users SET `;
            var attrs : string[] = [];

            if(name) {
                sql += `Name=?, `
                attrs.push(name)
            }
            if(email) {
                sql += `Email=?, `
                attrs.push(email)
            }
            if(discord) {
                sql += `Discord=?, `
                attrs.push(discord)
            }
            if(twitter) {
                sql += `Twitter=?, `
                attrs.push(twitter)
            }

            if (sql===`UPDATE Users SET `) {
                return new Error("No information to update");
            }

            sql = sql.substring(0,sql.length-1)+`WHERE ID=?);`;
            attrs.push(this.id.toString());

            db.then(db => {db.query(sql, attrs)
                .then(result => {
                    if (name) {this.displayname=name}
                    if (email) {this.email=email}
                    if (discord) {this.discord=discord}
                    if (twitter) {this.twitter=twitter}
                    resolve(0);
                })
                .catch(err => {
                    reject(err);
                });
            });
        });
        return err;
    }

    changePassword(oldpassword : string, newpassword : string, confirmpassword : string) : Promise<number> {

        var err : Promise<number> = new Promise(async (resolve, reject) => {
            if (oldpassword === newpassword) {
                reject(new Error(`Old and new passwords are the same`));
            } else if (!(newpassword === confirmpassword)) {
                reject(new Error(`New passwords are different`));
            }

            const oldBitArray = sjcl.hash.sha256.hash(oldpassword);
            const oldHash = sjcl.codec.hex.fromBits(oldBitArray);

            if (!(oldHash === this.password)) {
                reject(new Error(`Incorrect password`));
            }

            await isPasswordSecure(newpassword).catch(err => {
                reject(err);
            })

            const newBitArray = sjcl.hash.sha256.hash(newpassword);
            const newHash = sjcl.codec.hex.fromBits(newBitArray);

            var sql = `Update Users SET Password=${newHash} WHERE ID=${this.id};`

            db.then( db => {db.query(sql)
                .then( result => {
                    this.password = newHash;
                    resolve(0);
                })
                .catch( err => {
                    reject(err);
                });
            });
        });
        return err
    }

    comparePassword(password : string) {

        const bitArray = sjcl.hash.sha256.hash(password);
        const hash = sjcl.codec.hex.fromBits(bitArray);

        if (!(this.password === hash)) {
            return new Error("Incorrect password");
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