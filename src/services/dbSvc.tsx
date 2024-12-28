import { openDB } from 'idb';

export interface CardInfo {
    id: string;
    name: string;
    set: string;
    cn: string; // Collector Number.
    commander: boolean;
}

export interface DeckFormData {
    key? : string;
    name: string;
    url: string;
    contents: string;
}

export interface DeckInfo extends DeckFormData {
    mainboard: CardInfo[];
    commanders: CardInfo[];
}

enum LocalStorageKeys {
    SelectedDeckKey = 'selected-deck-key',
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
        db.createObjectStore(StoreNames.Deck, {
            keyPath: 'key',
            autoIncrement: true,
        });
    },
});

class DbSvc {
    private getCardImageKey(card: CardInfo, isTransformed: boolean): string {
        const { set, cn } = card;
        return JSON.stringify({ set, cn, isTransformed });
    }

    async getCardBlob(card: CardInfo, isTransformed: boolean): Promise<Blob> {
        return (await dbPromise).get(StoreNames.Card, this.getCardImageKey(card, isTransformed));
    }

    async putCardBlob(blob: Blob, card: CardInfo, isTransformed: boolean): Promise<void> {
        (await dbPromise).put(StoreNames.Card, blob, this.getCardImageKey(card, isTransformed));
    }

    public async GetDecks(): Promise<DeckInfo[]> {
        return (await dbPromise).getAll(StoreNames.Deck);
    }

    public async PutDeck(deckInfo: DeckInfo): Promise<void> {
        console.log(deckInfo);
        (await dbPromise).put(StoreNames.Deck, deckInfo);
    }

    public async DeleteDeck(deckInfo: DeckInfo): Promise<void> {
        (await dbPromise).delete(StoreNames.Deck, deckInfo.key!);
    }

    public GetSelectedDeckKey(): string | undefined {
        return localStorage.getItem(LocalStorageKeys.SelectedDeckKey) ?? undefined;
    }

    public PutSelectedDeckKey(value: string): void {
        localStorage.setItem(LocalStorageKeys.SelectedDeckKey, value.toString());
    }
}

export const DatabaseService = new DbSvc();
