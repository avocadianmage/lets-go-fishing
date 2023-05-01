import { DatabaseService } from './dbSvc';

const QUERY_THROTTLE_MS = 100;

const memoryCache: { [cardKey: string]: string } = {};
let promiseChain: Promise<string | undefined> = Promise.resolve(undefined);

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
    DatabaseService.putCardBlob(blob, name, set, isTransformed);
    return processBlob(blob, name, set, isTransformed);
};

export const GetCardImageUrl = async (
    name: string,
    set: string,
    isTransformed: boolean
): Promise<string | undefined> => {
    // Check if the URL is already stored in the local cache.
    const cachedUrl = memoryCache[DatabaseService.getCardImageKey(name, set, isTransformed)];
    if (cachedUrl) return cachedUrl;

    // Check if the blob is already stored in the IndexedDB.
    const blob = await DatabaseService.getCardBlob(name, set, isTransformed);
    if (blob) return processBlob(blob, name, set, isTransformed);

    // Fetch card from external web service.
    promiseChain = promiseChain.then(getPromisedTimeout).then(async () => {
        const result = await fetch(getQueryUrl(name, set));
        const json = await result.json();
        const cardFaces = json.card_faces;
        const cardUrl = saveToBlob(
            cardFaces ? cardFaces[0].image_uris.normal : json.image_uris.normal,
            name,
            set,
            false
        );
        const transformedCardUrl = cardFaces
            ? saveToBlob(cardFaces[1].image_uris.normal, name, set, true)
            : undefined;
        return isTransformed ? transformedCardUrl : cardUrl;
    });
    return promiseChain;
};
