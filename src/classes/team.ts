import { db } from '../db/dbconn.js';
import { OkPacket, RowDataPacket } from "mysql2";

export const TeamTable = class {

    getTeamById(id : number) {

    }
}

export interface Team extends RowDataPacket {
    gid: number;
    name: string;
    owner_gid: number;
    twitter: string | undefined;
}

export class Team {
    constructor() {

        this.gid=0;
        this.name="";
        this.owner_gid=0;

    }
}