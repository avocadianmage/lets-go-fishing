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
    url: string;
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
    async getCardBlob(name: string): Promise<Blob> {
        return (await dbPromise).get(StoreNames.Card, name);
    }

    async putCardBlob(blob: Blob, name: string): Promise<void> {
        (await dbPromise).put(StoreNames.Card, blob, name);
    }

    async getDecks(): Promise<DeckInfo[]> {
        return (await dbPromise).getAll(StoreNames.Deck);
    }

    async putDeck(deckInfo: DeckInfo): Promise<void> {
        (await dbPromise).put(StoreNames.Deck, deckInfo);
    }

    async deleteDeck(name: string): Promise<void> {
        const db = await dbPromise;
        const key = await db.getKeyFromIndex(StoreNames.Deck, IndexNames.Name, name);
        db.delete(StoreNames.Deck, key!);
    }

    getSelectedDeckName(): string | undefined  {
        return localStorage.getItem(LocalStorageKeys.SelectedDeckName) ?? undefined;
    }

    putSelectedDeckName(value: string): void {
        localStorage.setItem(LocalStorageKeys.SelectedDeckName, value);
    }
}

export const DatabaseService = new DbSvc();
