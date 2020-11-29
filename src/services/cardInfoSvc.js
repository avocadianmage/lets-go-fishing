import { DatabaseService } from "./dbSvc";

const MS_QUERY_RATE = 100;

class CardInfoSvc {
    constructor() {
        this.outgoingThrottle = Promise.resolve();
    }

    getQueryUrl(name) {
        return `https://api.scryfall.com/cards/named?exact=${name}`;
    }

    loadImage(blob, elem) {
        elem.setState({ imageUrl: URL.createObjectURL(blob) });
    }

    setCardImage(name, elem) {
        DatabaseService.getCardBlob(name).then(blob => {
            if (blob) {
                this.loadImage(blob, elem);
                return;
            }

            this.outgoingThrottle = this.outgoingThrottle
                // Fetch card information from external site.
                .then(() => fetch(this.getQueryUrl(name)))
                .then(result => result.json())
                .then(
                    // Store the fetched image to the database as a blob.
                    externalJson => {
                        fetch(externalJson.image_uris.normal)
                            .then(response => response.blob())
                            .then(blob => {
                                DatabaseService.putCardBlob(blob, name);
                                this.loadImage(blob, elem);
                            });
                    },
                    error => {
                        elem.setState({ error });
                        console.log(error);
                    }
                )
                // Ensure the next request is throttled.
                .then(() => new Promise(r => setTimeout(r, MS_QUERY_RATE)));
        });
    }
}

export const CardInfoService = new CardInfoSvc();
