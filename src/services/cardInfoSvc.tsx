import { DatabaseService } from './dbSvc';

const MS_QUERY_RATE = 80;

function getPromisedTimeout() {
    return new Promise(r => setTimeout(r, MS_QUERY_RATE));
}

function getQueryUrl(name: string, set: string) {
    return `https://api.scryfall.com/cards/named?exact=${name}&set=${set}`;
}

class CardInfoSvc {
    private outgoingThrottle: Promise<any> = Promise.resolve();

    getCardImageBlob(name: string, set: string) {
        return new Promise(resolve => {
            DatabaseService.getCardBlob(name).then(blob => {
                if (blob) {
                    resolve(blob);
                    return;
                }

                this.outgoingThrottle = this.outgoingThrottle
                    // Fetch card information from external site.
                    .then(() => fetch(getQueryUrl(name, set)))
                    .then(result => result.json())
                    // Store the fetched image to the database as a blob.
                    .then(json => {
                        getPromisedTimeout()
                            .then(() => fetch(json.image_uris.normal))
                            .then(response => response.blob())
                            .then(blob => {
                                DatabaseService.putCardBlob(blob, name);
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
