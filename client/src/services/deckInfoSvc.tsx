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
    isFoil: boolean;
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
                            foil: entry.isFoil,
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

    async getDecklist(moxfieldDeckUrl: string) {
        const response = await fetch('/api/get-deck', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ moxfieldDeckUrl }),
        });
        const json = await response.json();
        return this.parseAndSaveDeck(moxfieldDeckUrl, json);
    }
}

export const DeckInfoService = new DeckInfoSvc();
