import { DatabaseService, ICard } from "./dbSvc";

//#region Moxfield Definitions
// These are obviously very incomplete, but we don't have a full schema to access.
const moxfieldDeckApi = "https://api.moxfield.com/v2/decks/all/";

interface IMoxfieldDeck {
    name: string
    mainboard: { [cardTitle: string]: IMoxfieldEntry },
}

interface IMoxfieldEntry {
    card: IMoxfieldCard;
    quantity: number;
    isFoil: boolean;
}

interface IMoxfieldCard {
    set: string;
}
//#endregion Moxfield Definitions

class DeckInfoSvc {
    //#region Static Members
    private static readonly __fetchOptions: RequestInit = {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    };

    private static readonly __corsProxyUrl = "https://cors-anywhere.herokuapp.com/";

    private static __createMoxfieldApiUrl(deckUrl: string): string {
        const deckUrlPieces = deckUrl.split('/');
        return DeckInfoSvc.__corsProxyUrl + moxfieldDeckApi + deckUrlPieces[deckUrlPieces.length - 1];
    }
    //#endregion Static Members

    public async getDecklist(deckUrl: string): Promise<ICard[]> {
        const fetchResult = await fetch(DeckInfoSvc.__createMoxfieldApiUrl(deckUrl), DeckInfoSvc.__fetchOptions);
        const resultJson = await fetchResult.json();

        return this.__parseAndSaveDeck(resultJson);
    }

    private __parseAndSaveDeck(moxfieldDeck: IMoxfieldDeck): ICard[] {
        const cardList: ICard[] = Object.entries(moxfieldDeck.mainboard).map(([cardTitle, entry]) => ({
            name: cardTitle,
            set: entry.card.set,
            quantity: entry.quantity,
            foil: entry.isFoil,
        }));
        
        DatabaseService.putDeck(cardList, moxfieldDeck.name);
        return cardList;
    }
}

export const DeckInfoService = new DeckInfoSvc();
export type { ICard };
