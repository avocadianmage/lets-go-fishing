import { CardInfo, DatabaseService } from './dbSvc';

const MS_QUERY_RATE = 80;

function getPromisedTimeout() {
    return new Promise((r) => setTimeout(r, MS_QUERY_RATE));
}

function getQueryUrl(name: string, set: string) {
    return `https://api.scryfall.com/cards/named?exact=${name}&set=${set}`;
}

class CardInfoSvc {
    private outgoingThrottle: Promise<any> = Promise.resolve();
    private cache: any = {};

    processBlob(name: string, blob: Blob) {
        const url = URL.createObjectURL(blob);
        this.cache[name] = url;
        return url;
    }

    getCardImageUrl({ name, set }: CardInfo) {
        return new Promise(async (resolve) => {
            // Check if the URL is already stored in the local cache.
            const cachedUrl = this.cache[name];
            if (cachedUrl) {
                resolve(cachedUrl);
                return;
            }

            // Check if the blob is already stored in the IndexedDB.
            const blobFromIDB = await DatabaseService.getCardBlob(name, set);
            if (blobFromIDB) {
                resolve(this.processBlob(name, blobFromIDB));
                return;
            }

            this.outgoingThrottle = this.outgoingThrottle
                // Fetch card information from external site.
                .then(() => fetch(getQueryUrl(name, set)))
                .then((result) => result.json())
                // Store the fetched image to the database as a blob.
                .then((json) => {
                    this.outgoingThrottle = this.outgoingThrottle
                        .then(getPromisedTimeout)
                        .then(() => {
                            let image_uris: any;
                            if (json.card_faces) {
                                image_uris = json.card_faces[0].image_uris;
                            }
                            if (!image_uris) {
                                image_uris = json.image_uris;
                            }
                            return fetch(image_uris.normal);
                        })
                        .then((response) => response.blob())
                        .then((blob) => {
                            DatabaseService.putCardBlob(blob, name, set);
                            resolve(this.processBlob(name, blob));
                        });
                })
                // Ensure the next request is throttled.
                .then(getPromisedTimeout);
        });
    }
}

export const CardInfoService = new CardInfoSvc();
