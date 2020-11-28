const msRateLimit = 100;
let throttler = Promise.resolve();

export default class CardInfoSvc {
    getQueryUrl(name) {
        return `https://api.scryfall.com/cards/named?exact=${name}`;
    }

    setCardImage(name, elem) {
        throttler = throttler
            // AJAX request to external site for card information.
            .then(() => fetch(this.getQueryUrl(name)))
            .then(result => result.json())
            // Update state of the card element.
            .then(
                result => {
                    elem.setState({ imageUri: result.image_uris.png });
                },
                error => {
                    elem.setState({ error });
                    console.log(`Query for '${name}' failed: ${error}`);
                }
            )
            // Ensure future requests are throttled.
            .then(() => new Promise(r => setTimeout(r, msRateLimit)));
    }
}
