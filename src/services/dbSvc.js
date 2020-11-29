import { openDB } from 'idb';

const DB_NAME = "cards_db";
const DB_VERSION = 1;
const STORE_NAME = "cards_os";

const dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
        db.createObjectStore(STORE_NAME);
    },
});

class DbSvc {
    async getCardBlob(name) {
        return (await dbPromise).get(STORE_NAME, name);
    }

    async putCardBlob(blob, name) {
        return (await dbPromise).put(STORE_NAME, blob, name);
    }
}

export const DatabaseService = new DbSvc();
