import { CardExternalInfo, CardInfo, DatabaseService } from './dbSvc';

const QUERY_THROTTLE_MS = 100;

let promiseChain: Promise<void> = Promise.resolve();

const getPromisedTimeout = () => new Promise((r) => setTimeout(r, QUERY_THROTTLE_MS));

const getQueryUrl = (card: CardInfo): string => {
    const { set, cn } = card;
    const encodedSet = encodeURIComponent(set);
    const encodedCN = encodeURIComponent(cn);
    return `https://api.scryfall.com/cards/${encodedSet}/${encodedCN}`;
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
const fetchCardInfo = async (card: CardInfo): Promise<void> => {
    const result = await fetch(getQueryUrl(card));

    if (result.status !== 200) {
        console.log('Card lookup failed for: ' + JSON.stringify(card));
    }

    const json = await result.json();
    const partner: boolean = json.keywords.includes('Partner');

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
};

export const PopulateCardExternalInfo = async (card: CardInfo): Promise<void> => {
    // Check if the URL is already stored in the local cache.
    if (card.externalInfo) return;

    card.externalInfo = await DatabaseService.GetCardExternalInfo(card);
    if (card.externalInfo) return;

    // Fetch card from external web service.
    promiseChain = promiseChain.then(getPromisedTimeout).then(() => fetchCardInfo(card));
    return promiseChain;
};

export const GetCardImageUrls = (
    externalInfo: CardExternalInfo
): { frontUrl: string; backUrl?: string } => {
    const frontUrl = URL.createObjectURL(externalInfo.frontBlob);
    const backUrl = externalInfo.backBlob ? URL.createObjectURL(externalInfo.backBlob) : undefined;
    return { frontUrl, backUrl };
};
