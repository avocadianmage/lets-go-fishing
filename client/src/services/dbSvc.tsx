import { openDB } from 'idb';

export interface CardInfo {
    id: number;
    name: string;
    set: string;
    foil: boolean;
    commander: boolean;
}

enum IndexNames {
    Name = 'name',
}

export interface DeckInfo {
    [IndexNames.Name]: string;
    mainboard: CardInfo[];
    commanders: CardInfo[];
}

enum LocalStorageKeys {
    SelectedDeckName = 'selected-deck-name',
}

const dbName = 'lets-go-fishing-db';
const dbVersion = 1;

enum StoreNames {
    Card = 'cards-os',
    Deck = 'decks-os',
}

const dbPromise = openDB(dbName, dbVersion, {
    upgrade(db) {
        db.createObjectStore(StoreNames.Card);
        const deckStore = db.createObjectStore(StoreNames.Deck, {
            keyPath: 'id',
            autoIncrement: true,
        });
        deckStore.createIndex(IndexNames.Name, IndexNames.Name);
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
        return (await dbPromise).getAll(StoreNames.Deck);
    }

    async putDeck(deckInfo: DeckInfo) {
        (await dbPromise).put(StoreNames.Deck, deckInfo);
    }

    async deleteDeck(name: string) {
        const db = await dbPromise;
        const key = await db.getKeyFromIndex(StoreNames.Deck, IndexNames.Name, name);
        db.delete(StoreNames.Deck, key!);
    }

    getSelectedDeckName() {
        return localStorage.getItem(LocalStorageKeys.SelectedDeckName);
    }

    putSelectedDeckName(value: string) {
        localStorage.setItem(LocalStorageKeys.SelectedDeckName, value);
    }
}

export const DatabaseService = new DbSvc();
