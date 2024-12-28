import { openDB } from 'idb';

export interface CardExternalInfo {
    frontBlob: Blob;
    backBlob?: Blob;
    partner: boolean;
}

export interface CardInfo {
    id: string;
    name: string;
    set: string;
    cn: string; // Collector Number.
    commander: boolean;
    externalInfo?: CardExternalInfo;
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
    public GetCardImageKey(card: CardInfo): string {
        const { set, cn } = card;
        return JSON.stringify({ set, cn });
    }

    public async GetCardExternalInfo(card: CardInfo): Promise<CardExternalInfo> {
        return (await dbPromise).get(StoreNames.Card, this.GetCardImageKey(card));
    }

    public async PutCardExternalInfo(card: CardInfo): Promise<void> {
        (await dbPromise).put(StoreNames.Card, card.externalInfo!, this.GetCardImageKey(card));
    }

    public async GetDecks(): Promise<DeckInfo[]> {
        return (await dbPromise).getAll(StoreNames.Deck);
    }

    public async PutDeck(deckInfo: DeckInfo): Promise<void> {
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
