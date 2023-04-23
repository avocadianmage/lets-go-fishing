import { CardInfo, DatabaseService } from './dbSvc';

const QUERY_THROTTLE_MS = 100;

const memoryCache: { [cardName: string]: string } = {};
let promiseChain: Promise<string> = Promise.resolve('');

const getPromisedTimeout = () => new Promise((r) => setTimeout(r, QUERY_THROTTLE_MS));

const getQueryUrl = (name: string, set: string): string => {
    name = encodeURIComponent(name);
    set = encodeURIComponent(set);
    return `https://api.scryfall.com/cards/named?exact=${name}&set=${set}`;
};

const processBlob = (cardName: string, blob: Blob): string => {
    const url = URL.createObjectURL(blob);
    memoryCache[cardName] = url;
    return url;
};

export const GetCardImageUrl = async ({ name, set }: CardInfo): Promise<string> => {
    // Check if the URL is already stored in the local cache.
    const cachedUrl = memoryCache[name];
    if (cachedUrl) return cachedUrl;

    // Check if the blob is already stored in the IndexedDB.
    const blob = await DatabaseService.getCardBlob(name, set);
    if (blob) return processBlob(name, blob);

    // Fetch card from external web service.
    promiseChain = promiseChain.then(getPromisedTimeout).then(async () => {
        const result = await fetch(getQueryUrl(name, set));
        const json = await result.json();
        const image_uris = json.card_faces
            ? json.card_faces[0].image_uris ?? json.image_uris
            : json.image_uris;
        const cardImage = await fetch(image_uris.normal);
        const blob = await cardImage.blob();
        DatabaseService.putCardBlob(blob, name, set);
        return processBlob(name, blob);
    });
    return promiseChain;
};
