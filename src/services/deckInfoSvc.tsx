import { DatabaseService } from "./dbSvc";

interface MoxfieldDeck {
    name: string;
    mainboard: { [cardName: string]: MoxfieldDeckEntry }
}

interface MoxfieldDeckEntry {
    card: MoxfieldCardInfo;
    quantity: number;
    isFoil: boolean;
}

interface MoxfieldCardInfo {
    set: string;
}

class DeckInfoSvc {
    private static readonly apiUrlPrefix = 
        'https://api.moxfield.com/v2/decks/all/';
    private static readonly corsProxyPrefix = 
        'https://cors-anywhere.herokuapp.com/';
    private static readonly fetchOptions: RequestInit = {
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
    }

    private createApiUrl(deckUrl: string) {
        const deckUrlPieces = deckUrl.split('/');
        return DeckInfoSvc.corsProxyPrefix + DeckInfoSvc.apiUrlPrefix +
            deckUrlPieces[deckUrlPieces.length - 1];
    }

    private parseAndSaveDeck({ name, mainboard }: MoxfieldDeck) {
        const cardList = [];
        let id = 0;
        for (let [cardName, entry] of Object.entries(mainboard)) {
            for (let i = 0; i < entry.quantity; i++) {
                cardList[id] = {
                    id: id++,
                    name: cardName,
                    set: entry.card.set,
                    foil: entry.isFoil,
                };
            }
        }
        
        DatabaseService.putDeck(cardList, name);
        return cardList;
    }

    async getDecklist(deckUrl: string) {
        const result = await fetch(
            this.createApiUrl(deckUrl), DeckInfoSvc.fetchOptions
        );
        const json = await result.json();
        return this.parseAndSaveDeck(json);
    }
}

export const DeckInfoService = new DeckInfoSvc();
