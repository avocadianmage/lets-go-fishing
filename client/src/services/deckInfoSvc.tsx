import { DatabaseService, DeckInfo } from './dbSvc';

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

class DeckInfoSvc {
    private parseAndSaveDeck(
        url: string,
        { name, commanders, mainboard }: MoxfieldDeck
    ): DeckInfo | undefined {
        try {
            let id = 0;
            const toCardList = (moxfieldCardList: MoxfieldCardList, areCommanders: boolean) => {
                const cardList = [];
                for (let [cardName, entry] of Object.entries(moxfieldCardList)) {
                    for (let i = 0; i < entry.quantity; i++) {
                        cardList[id] = {
                            id: id++,
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
    }

    private createMoxfieldApiUrl(moxfieldDeckUrl: string) {
        const apiUrlPrefix = 'https://api.moxfield.com/v2/decks/all/';
        const deckUrlPieces = moxfieldDeckUrl.split('/');
        return apiUrlPrefix + deckUrlPieces[deckUrlPieces.length - 1];
    }

    async getDecklist(moxfieldDeckUrl: string) {
        const moxfieldApiUrl = this.createMoxfieldApiUrl(moxfieldDeckUrl);
        const response = await fetch('/api/get-deck', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ moxfieldApiUrl }),
        });
        const json = await response.json();
        return this.parseAndSaveDeck(moxfieldDeckUrl, json);
    }
}

export const DeckInfoService = new DeckInfoSvc();
