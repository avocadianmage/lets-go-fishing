import { DatabaseService } from './dbSvc';

const QUERY_THROTTLE_MS = 100;

const memoryCache: { [cardKey: string]: string } = {};
let promiseChain: Promise<[front: string, back: string]> = Promise.resolve(['', '']);

const getPromisedTimeout = () => new Promise((r) => setTimeout(r, QUERY_THROTTLE_MS));

const getQueryUrl = (name: string, set: string): string => {
    name = encodeURIComponent(name);
    set = encodeURIComponent(set);
    return `https://api.scryfall.com/cards/named?exact=${name}&set=${set}`;
};

const processBlob = (blob: Blob, name: string, set: string, isTransformed: boolean): string => {
    const url = URL.createObjectURL(blob);
    memoryCache[DatabaseService.getCardImageKey(name, set, isTransformed)] = url;
    return url;
};

const saveToBlob = async (
    imageUrl: string,
    name: string,
    set: string,
    isTransformed: boolean
): Promise<string> => {
    const cardImage = await fetch(imageUrl);
    const blob = await cardImage.blob();
    await DatabaseService.putCardBlob(blob, name, set, isTransformed);
    return processBlob(blob, name, set, isTransformed);
};

const getImageUrlFromJson = (json: any, imageUrisNode: any): any => {
    // Log any unexpected response.
    if (!imageUrisNode) console.log(json);
    return imageUrisNode.normal;
}

export const GetCardImageUrl = async (
    name: string,
    set: string
): Promise<[front: string, back: string]> => {
    // Check if the URL is already stored in the local cache.
    const frontUrlFromMemory = memoryCache[DatabaseService.getCardImageKey(name, set, false)];
    const backUrlFromMemory = memoryCache[DatabaseService.getCardImageKey(name, set, true)];
    if (frontUrlFromMemory) {
        return [frontUrlFromMemory, backUrlFromMemory];
    }

    // Check if the blob is already stored in the IndexedDB.
    const frontBlob = await DatabaseService.getCardBlob(name, set, false);
    if (frontBlob) {
        const backBlob = await DatabaseService.getCardBlob(name, set, true);
        const frontUrlFromBlob = processBlob(frontBlob, name, set, false);
        const backUrlFromBlob = backBlob ? processBlob(backBlob, name, set, true) : '';
        return [frontUrlFromBlob, backUrlFromBlob];
    }

    // Fetch card from external web service.
    promiseChain = promiseChain.then(getPromisedTimeout).then(async () => {
        const result = await fetch(getQueryUrl(name, set));
        const json = await result.json();
        const cardFaces = json.card_faces;

        let frontUrlRemote = '';
        let backUrl = '';
        if (cardFaces && cardFaces[0].image_uris) {
            frontUrlRemote = getImageUrlFromJson(json, cardFaces[0].image_uris);
            const backUrlRemote = getImageUrlFromJson(json, cardFaces[1].image_uris);
            // Esnure back image is saved before front to avoid loading interruptions causing 
            // desyncs.
            backUrl = await saveToBlob(backUrlRemote, name, set, true);
        } else {
            frontUrlRemote = getImageUrlFromJson(json, json.image_uris);
        }
        const frontUrl = await saveToBlob(frontUrlRemote, name, set, false);

        return [frontUrl, backUrl];
    });
    return promiseChain;
};
