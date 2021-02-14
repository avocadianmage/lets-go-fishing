import { DBSchema, openDB } from 'idb';

export interface CardInfo {
    id: number;
    name: string;
    set: string;
    foil: boolean;
}

export interface DeckInfo {
    mainboard: CardInfo[];
    commanders: CardInfo[];
}

const dbName = 'lets-go-fishing-db';
const dbVersion = 1;

interface FishingSchema extends DBSchema {
    'cards-os': {
        key: string;
        value: Blob;
    };

    'decks-os': {
        key: string;
        value: DeckInfo;
    };
}

enum StoreNames {
    Card = 'cards-os',
    Deck = 'decks-os',
}

const dbPromise = openDB<FishingSchema>(dbName, dbVersion, {
    upgrade(db) {
        db.createObjectStore(StoreNames.Card);
        db.createObjectStore(StoreNames.Deck);
    },
});

class DbSvc {
    async getCardBlob(name: string) {
        return (await dbPromise).get(StoreNames.Card, name);
    }

    async putCardBlob(blob: Blob, name: string) {
        return (await dbPromise).put(StoreNames.Card, blob, name);
    }

    // Retrieve the first deck for now.
    async getDeck() {
        const decks = await (await dbPromise).getAll(StoreNames.Deck);
        return decks.length ? decks[0] : null;
    }

    async putDeck(deckInfo: DeckInfo, name: string) {
        return (await dbPromise).put(StoreNames.Deck, deckInfo, name);
    }
}

export const DatabaseService = new DbSvc();
