import { CardInfo, DatabaseService } from './dbSvc';

const QUERY_THROTTLE_MS = 100;

const memoryCache: { [cardKey: string]: string } = {};
let promiseChain: Promise<[front: string, back: string]> = Promise.resolve(['', '']);

const getPromisedTimeout = () => new Promise((r) => setTimeout(r, QUERY_THROTTLE_MS));

const getQueryUrl = (card: CardInfo): string => {
    const { set, cn } = card;
    const encodedSet = encodeURIComponent(set);
    const encodedCN = encodeURIComponent(cn);
    return `https://api.scryfall.com/cards/${encodedSet}/${encodedCN}`;
};

const processBlob = (blob: Blob, card: CardInfo, isTransformed: boolean): string => {
    const url = URL.createObjectURL(blob);
    memoryCache[DatabaseService.getCardImageKey(card, isTransformed)] = url;
    return url;
};

const saveToBlob = async (
    imageUrl: string,
    card: CardInfo,
    isTransformed: boolean
): Promise<string> => {
    // No need to throttle image URL fetch as it (scryfall.io) does not have a rate limit.
    const cardImage = await fetch(imageUrl);
    const blob = await cardImage.blob();
    await DatabaseService.putCardBlob(blob, card, isTransformed);
    return processBlob(blob, card, isTransformed);
};

const coreGetCardImageUrl = async (card: CardInfo): Promise<[front: string, back: string]> => {
    const result = await fetch(getQueryUrl(card));

    if (result.status !== 200) {
        console.log('Card lookup failed for: ' + JSON.stringify(card));
        return ['', ''];
    }

    const json = await result.json();
    const jsonNodeForTwoSidedCard = json.card_faces;
    const jsonNodeForOneSidedCardImage = json.image_uris;

    let frontUrlRemote = '';
    let backUrl = '';
    if (jsonNodeForTwoSidedCard && jsonNodeForTwoSidedCard[0].image_uris) {
        frontUrlRemote = jsonNodeForTwoSidedCard[0].image_uris.normal;
        const backUrlRemote = jsonNodeForTwoSidedCard[1].image_uris.normal;
        // Esnure back image is saved before front to avoid loading interruptions causing
        // desyncs.
        backUrl = await saveToBlob(backUrlRemote, card, true);
    } else {
        frontUrlRemote = jsonNodeForOneSidedCardImage.normal;
    }
    const frontUrl = await saveToBlob(frontUrlRemote, card, false);

    return [frontUrl, backUrl];
};

export const GetCardImageUrl = async (card: CardInfo): Promise<[front: string, back: string]> => {
    const { set, cn } = card;

    // Check if the URL is already stored in the local cache.
    const frontUrlFromMemory = memoryCache[DatabaseService.getCardImageKey(card, false)];
    const backUrlFromMemory = memoryCache[DatabaseService.getCardImageKey(card, true)];
    if (frontUrlFromMemory) {
        return [frontUrlFromMemory, backUrlFromMemory];
    }

    // Check if the blob is already stored in the IndexedDB.
    const frontBlob = await DatabaseService.getCardBlob(card, false);
    if (frontBlob) {
        const backBlob = await DatabaseService.getCardBlob(card, true);
        const frontUrlFromBlob = processBlob(frontBlob, card, false);
        const backUrlFromBlob = backBlob ? processBlob(backBlob, card, true) : '';
        return [frontUrlFromBlob, backUrlFromBlob];
    }

    // Fetch card from external web service.
    promiseChain = promiseChain.then(getPromisedTimeout).then(() => coreGetCardImageUrl(card));
    return promiseChain;
};
