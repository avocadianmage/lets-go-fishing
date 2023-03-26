import { CardInfo, DatabaseService, DeckInfo } from './dbSvc';

interface MoxfieldDeck {
    name: string;
    mainboard: MoxfieldCardList;
    commanders: MoxfieldCardList;
}

interface MoxfieldCardList {
    [cardName: string]: MoxfieldDeckEntry;
}

interface MoxfieldDeckEntry {
    card: MoxfieldCardInfo;
    quantity: number;
}

interface MoxfieldCardInfo {
    set: string;
}

const parseAndSaveDeck = (
    url: string,
    { name, commanders, mainboard }: MoxfieldDeck
): DeckInfo | undefined => {
    try {
        let id = 0;
        const toCardList = (moxfieldCardList: MoxfieldCardList, areCommanders: boolean) => {
            const cardList: CardInfo[] = [];
            for (let [cardName, entry] of Object.entries(moxfieldCardList)) {
                for (let i = 0; i < entry.quantity; i++) {
                    cardList[id] = {
                        id: `card${++id}`,
                        name: cardName,
                        set: entry.card.set,
                        commander: areCommanders,
                    };
                }
            }
            return cardList.filter((card) => card !== undefined);
        };

        const deckInfo = {
            url,
            name,
            mainboard: toCardList(mainboard, false),
            commanders: toCardList(commanders, true),
        };
        DatabaseService.putDeck(deckInfo);
        return deckInfo;
    } catch {
        // Return undefined if deck parsing failed.
        return undefined;
    }
};

const createDeckAggregatorUrl = (moxfieldDeckUrl: string) => {
    const corsApiUrl = 'https://guarded-brushlands-38173.herokuapp.com/';
    const deckAggregatorApiUrl = 'https://api.moxfield.com/v2/decks/all/';

    const deckUrlPieces = moxfieldDeckUrl.split('/');
    return corsApiUrl + deckAggregatorApiUrl + deckUrlPieces[deckUrlPieces.length - 1];
};

export const FetchDecklist = async (moxfieldDeckUrl: string) => {
    const deckAggregatorUrl = createDeckAggregatorUrl(moxfieldDeckUrl);
    const response = await fetch(deckAggregatorUrl);
    const json = await response.json();
    return parseAndSaveDeck(moxfieldDeckUrl, json);
};
