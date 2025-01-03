import { CardInfo, DatabaseService } from './dbSvc';

export interface CardBlobUrls {
    frontUrl: string;
    backUrl: string;
}

// Use a higher throttle time when not in production.
const QUERY_THROTTLE_MS = window.location.hostname === 'localhost' ? 500 : 100;

const memoryCache: { [key: string]: CardBlobUrls } = {};

let promiseChain: Promise<CardBlobUrls> = Promise.resolve({ frontUrl: '', backUrl: '' });

const getPromisedTimeout = () => new Promise((r) => setTimeout(r, QUERY_THROTTLE_MS));

const getQueryUrl = (card: CardInfo, byName: boolean = false): string => {
    const { set, cn, name } = card;

    if (byName) {
        const encodedName = encodeURIComponent(name);
        return `https://api.scryfall.com/cards/named?exact=${encodedName}`;
    }

    const encodedSet = encodeURIComponent(set);
    const encodedCN = encodeURIComponent(cn);
    return `https://api.scryfall.com/cards/${encodedSet}/${encodedCN}`;
};

const generateCardBlobUrls = (card: CardInfo): CardBlobUrls => {
    const { frontBlob, backBlob } = card.externalInfo!;
    const frontUrl = URL.createObjectURL(frontBlob);
    const backUrl = backBlob ? URL.createObjectURL(backBlob) : '';
    const cardBlobUrls: CardBlobUrls = { frontUrl, backUrl };
    memoryCache[DatabaseService.GetCardInfoKey(card)] = cardBlobUrls;
    return cardBlobUrls;
};

const saveToBlobAndSetExternalCardInfo = async (
    frontUrlRemote: string,
    backUrlRemote: string,
    partner: boolean,
    card: CardInfo
): Promise<void> => {
    // No need to throttle image URL fetch as Scryfall does not have a rate limit for images.
    const frontImage = await fetch(frontUrlRemote);
    const frontBlob = await frontImage.blob();

    const backImage: Response | undefined = backUrlRemote ? await fetch(backUrlRemote) : undefined;
    const backBlob = backImage ? await backImage.blob() : undefined;

    card.externalInfo = { frontBlob, backBlob, partner };
    await DatabaseService.PutCardExternalInfo(card);
};

// Populates the externalInfo property of the card object and stores it in the IndexedDB.
const fetchCardInfo = async (card: CardInfo): Promise<CardBlobUrls> => {
    let result = await fetch(getQueryUrl(card));

    // If lookup by set and collector number fails, try by name.
    if (result.status === 404) {
        console.log('Card lookup by set and collector number failed for: ' + JSON.stringify(card));
        console.log('Fallback to looking up card by name...');
        result = await fetch(getQueryUrl(card, true));
    }

    // If lookup by name fails, return empty URLs.
    if (result.status !== 200) {
        console.log('Fallback card lookup by name failed for: ' + JSON.stringify(card));
        return { frontUrl: '', backUrl: '' };
    }

    const json = await result.json();
    const partner: boolean = json.keywords?.includes('Partner') ?? false;

    const jsonNodeForTwoSidedCard = json.card_faces;
    const jsonNodeForOneSidedCardImage = json.image_uris;

    let frontUrlRemote: string;
    let backUrlRemote: string;
    if (jsonNodeForTwoSidedCard && jsonNodeForTwoSidedCard[0].image_uris) {
        frontUrlRemote = jsonNodeForTwoSidedCard[0].image_uris.normal;
        backUrlRemote = jsonNodeForTwoSidedCard[1].image_uris.normal;
    } else {
        frontUrlRemote = jsonNodeForOneSidedCardImage.normal;
        backUrlRemote = '';
    }

    await saveToBlobAndSetExternalCardInfo(frontUrlRemote, backUrlRemote, partner, card);
    return generateCardBlobUrls(card);
};

export const PopulateCardExternalInfo = async (card: CardInfo): Promise<CardBlobUrls> => {
    // Check if the URL is already stored in the local cache.
    const cardBlobUrls = memoryCache[DatabaseService.GetCardInfoKey(card)];
    if (card.externalInfo && cardBlobUrls) return cardBlobUrls;

    // Check if the card is already stored in the IndexedDB.
    card.externalInfo = await DatabaseService.GetCardExternalInfo(card);
    if (card.externalInfo) return generateCardBlobUrls(card);

    // Fetch card from external web service.
    promiseChain = promiseChain.then(getPromisedTimeout).then(() => fetchCardInfo(card));
    return promiseChain;
};
