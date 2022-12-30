import sjcl from 'sjcl'
import Team from './team.js'

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

export class UserTable {
    constructor() {

    }
    getUserById(id) {

    }
}

export class User {
    constructor(name, email, password, discord=null, twitter=null, twofa=false) {
        this.name=name;
        this.email=email;

        const myBitArray = sjcl.hash.sha256.hash(password);
        const myHash = sjcl.codec.hex.fromBits(myBitArray);

        this.password=myHash;
        if(discord) { this.discord=discord }
        if(twitter) { this.twitter=twitter }
        if(twofa) {
            this.twofa = createRandomString(15);
        }
    }
    createTeam(name, twitter=null) {
        return new Team(name, twitter);
    }

    addUserAsAdmin(userid)
}
