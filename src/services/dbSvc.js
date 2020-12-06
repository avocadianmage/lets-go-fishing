import { openDB } from 'idb';

const DB_NAME = "lets-go-fishing-db";
const DB_VERSION = 1;
const CARD_STORE_NAME = "cards-os";
const DECK_STORE_NAME = "decks-os";

const dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
        db.createObjectStore(CARD_STORE_NAME);
        db.createObjectStore(DECK_STORE_NAME);
    },
});

class DbSvc {
    async getCardBlob(name) {
        return (await dbPromise).get(CARD_STORE_NAME, name);
    }

    async putCardBlob(blob, name) {
        return (await dbPromise).put(CARD_STORE_NAME, blob, name);
    }

    // Retrieve the first deck for now.
    async getDeck() {
        const decks = await (await dbPromise).getAll(DECK_STORE_NAME);
        return decks.length ? decks[0] : null;
    }

    async putDeck(cardList, name) {
        return (await dbPromise).put(DECK_STORE_NAME, cardList, name);
    }
}

export const DatabaseService = new DbSvc();
