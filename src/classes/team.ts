export class TeamTable {
    constructor() {

    }
    getTeamById(id) {

    }
}

export class Team {
    constructor(name, twitter=null) {
        this.name=name;
        if(twitter) { this.twitter=twitter }
    }
}