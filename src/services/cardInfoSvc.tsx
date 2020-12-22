import { CardInfo, DatabaseService } from "./dbSvc";

const MS_QUERY_RATE = 80;

function getPromisedTimeout() {
    return new Promise(r => setTimeout(r, MS_QUERY_RATE));
}

function getQueryUrl({ name, set }: CardInfo) {
    return `https://api.scryfall.com/cards/named?exact=${name}&set=${set}`;
}

class CardInfoSvc {
    private outgoingThrottle: Promise<any>;

    constructor() {
        this.outgoingThrottle = Promise.resolve();
    }

    getCardImageBlob(cardInfo: CardInfo) {
        return new Promise(resolve => {
            DatabaseService.getCardBlob(cardInfo.name).then(blob => {
                if (blob) {
                    resolve(blob);
                    return;
                }

                this.outgoingThrottle = this.outgoingThrottle
                    // Fetch card information from external site.
                    .then(() => fetch(getQueryUrl(cardInfo)))
                    .then(result => result.json())
                    // Store the fetched image to the database as a blob.
                    .then(json => {
                        getPromisedTimeout()
                            .then(() => fetch(json.image_uris.normal))
                            .then(response => response.blob())
                            .then(blob => {
                                DatabaseService.putCardBlob(
                                    blob, 
                                    cardInfo.name
                                );
                                resolve(blob);
                            });
                    })
                    // Ensure the next request is throttled.
                    .then(getPromisedTimeout);
            });
        });
    }
}

export const CardInfoService = new CardInfoSvc();
