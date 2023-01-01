import { db } from "./db/dbconn";

db.end( function (err) {
    if (err) {
        db.destroy();
    }
})

process.exit(0);