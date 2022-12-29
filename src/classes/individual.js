import sjcl from 'sjcl'

class Individual {
    constructor(name, email, password, discord=null, twitter=null, twofa=false) {
        this.name=name;
        this.email=email;

        const myBitArray = sjcl.hash.sha256.hash(password);
        const myHash = sjcl.codec.hex.fromBits(myBitArray);

        this.password=myHash;
        if(discord) { this.discord=discord }
        if(twitter) { this.twitter=twitter }
        if(twofa) {
            this.twofa = Math.random().toString(36).substring(2,17);
        }
    }
}