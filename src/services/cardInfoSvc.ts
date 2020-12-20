import { DatabaseService } from "./dbSvc";

const MS_QUERY_RATE = 80;

function getPromisedTimeout(): Promise<number> {
    return new Promise(r => setTimeout(r, MS_QUERY_RATE));
}

function getQueryUrl(name: string, set: string): string {
    return `https://api.scryfall.com/cards/named?exact=${name}&set=${set}`;
}

class CardInfoSvc {
    private __ongoingThrottle: Promise<any>;

    constructor() {
        this.__ongoingThrottle = Promise.resolve();
    }

    public getCardImageBlob(name: string, set: string):Promise<Blob> {
        return new Promise(resolve => {
            DatabaseService.getCardBlob(name).then(blob => {
                if (blob) {
                    resolve(blob);
                    return;
                }

                this.__ongoingThrottle = this.__ongoingThrottle
                    // Fetch card information from external site.
                    .then(() => fetch(getQueryUrl(name, set)))
                    .then(result => result.json())
                    .then(
                        // Store the fetched image to the database as a blob.
                        json => {
                            getPromisedTimeout()
                                .then(() => fetch(json.image_uris.normal))
                                .then(response => response.blob())
                                .then(blob => {
                                    DatabaseService.putCardBlob(blob, name);
                                    resolve(blob);
                                });
                        },
                        error => console.log(error)
                    )
                    // Ensure the next request is throttled.
                    .then(getPromisedTimeout);
            });
        });
    }
}

export const CardInfoService = new CardInfoSvc();
