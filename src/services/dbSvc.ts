import { openDB, DBSchema } from 'idb';

export interface ICard {
    name: string,
    set: string,
    quantity: number,
    foil: boolean
}

const DB_NAME = "lets-go-fishing-db";
const DB_VERSION = 1;

enum StoreNames {
    Card = "cards-os",
    Deck = "decks-os"
}

interface IFishingSchema extends DBSchema {
    "cards-os": {
        key: string;
        value: Blob;
    };

    "decks-os": {
        key: string;
        value: ICard[];
    };
}

const dbPromise = openDB<IFishingSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
        db.createObjectStore(StoreNames.Card);
        db.createObjectStore(StoreNames.Deck);
    },
});

class DbSvc {
    public async getCardBlob(name: string): Promise<any> {
        return (await dbPromise).get(StoreNames.Card, name);
    }

    public async putCardBlob(blob: Blob, name: string): Promise<any> {
        return (await dbPromise).put(StoreNames.Card, blob, name);
    }

    // Retrieve the first deck for now.
    public async getDeck(): Promise<any> {
        const decks = await (await dbPromise).getAll(StoreNames.Deck);
        return decks.length ? decks[0] : null;
    }

    public async putDeck(cardList: ICard[], name: string): Promise<any> {
        return (await dbPromise).put(StoreNames.Deck, cardList, name);
    }
}

export const DatabaseService = new DbSvc();
