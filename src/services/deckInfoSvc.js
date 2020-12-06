import { DatabaseService } from "./dbSvc";

function getApiUrl(deckUrl) {
    const split = deckUrl.split('/');
    const proxyPrefix = 'https://cors-anywhere.herokuapp.com/';
    const apiPrefix = 'https://api.moxfield.com/v2/decks/all/';
    return proxyPrefix + apiPrefix + split[split.length - 1];
}

function parseAndSaveDeck(json) {
    const cardList = Object.keys(json.mainboard);
    DatabaseService.putDeck(cardList, json.name);
    return cardList;
}

class DeckInfoSvc {
    getDecklist(deckUrl) {
        return new Promise(resolve => {
            fetch(
                getApiUrl(deckUrl), 
                { 'content-type': 'application/x-www-form-urlencoded' }
            )
            .then(result => result.json())
            .then(json => resolve(parseAndSaveDeck(json)))
        });
    }
}

export const DeckInfoService = new DeckInfoSvc();
