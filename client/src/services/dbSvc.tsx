import { DBSchema, openDB } from 'idb';

export interface CardInfo {
    id: number;
    name: string;
    set: string;
    foil: boolean;
    commander: boolean;
}

export interface DeckInfo {
    name: string;
    mainboard: CardInfo[];
    commanders: CardInfo[];
}

const dbName = 'lets-go-fishing-db';
const dbVersion = 1;

enum StoreNames {
    Card = 'cards-os',
    Deck = 'decks-os',
}

interface FishingSchema extends DBSchema {
    [StoreNames.Card]: {
        key: string;
        value: Blob;
    };

    [StoreNames.Deck]: {
        key: number;
        value: DeckInfo;
    };
}

const dbPromise = openDB<FishingSchema>(dbName, dbVersion, {
    upgrade(db) {
        db.createObjectStore(StoreNames.Card);
        db.createObjectStore(StoreNames.Deck, { keyPath: 'id', autoIncrement: true });
    },
});

class DbSvc {
    async getCardBlob(name: string) {
        return (await dbPromise).get(StoreNames.Card, name);
    }

    async putCardBlob(blob: Blob, name: string) {
        (await dbPromise).put(StoreNames.Card, blob, name);
    }

    async getDecks() {
        return (await dbPromise).getAll(StoreNames.Deck)
    }

    async putDeck(deckInfo: DeckInfo) {
        (await dbPromise).put(StoreNames.Deck, deckInfo);
    }
}

export const DatabaseService = new DbSvc();
