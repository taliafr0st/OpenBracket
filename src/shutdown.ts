import { db } from "./db/dbconn";

db.then( conn => {
    conn.end()
    .catch( err => {
        conn.destroy();
    });
})

process.exit(0);