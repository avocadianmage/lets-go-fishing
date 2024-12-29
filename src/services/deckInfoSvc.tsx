import { DeckType } from '../components/lefter/deckEditModal';
import { PopulateCardExternalInfo } from './cardInfoSvc';
import { CardInfo, DeckFormData, DeckInfo } from './dbSvc';

//ckgtest clean up to remove this enum and just check for SIDEBOARD
enum Header {
    Sideboard = 'SIDEBOARD',
    Other = 'OTHER',
}

const checkForHeader = (line: string): Header | undefined => {
    line = line.trim().toUpperCase();

    // If first character is a number, the line is a card, not a header.
    if (!isNaN(parseInt(line[0]))) return undefined;

    for (const header of Object.values(Header)) {
        if (line.startsWith(header)) return header;
    }
    return Header.Other;
};

const hasMetadata = (line: string): boolean => {
    line = line.trim().toUpperCase();
    const MetadataIndicator1 = '*';
    const MetadataIndicator2 = '^';
    return line.endsWith(MetadataIndicator1) || line.endsWith(MetadataIndicator2);
};

const parseContentsLine = (
    line: string
): { quantity: number; name: string; set: string; cn: string } => {
    let pieces: string[] = line.split(' ').filter((piece) => piece !== '');
    pieces = hasMetadata(line) ? pieces.slice(0, -1) : pieces;

    // Trim the 'x' at the end if it exists.
    const quantity: number = parseInt(pieces[0].replace(/x$/, ''));

    const name: string = pieces.slice(1, -2).join(' ');

    // Trim parentheses from set name if they exist.
    const set = pieces.slice(-2, -1)[0].replace(/[()]/g, '');

    // Collector number is case sensitive.
    const cn = pieces.slice(-1)[0];

    return { quantity, name, set, cn };
};

const parseContentsToDeck = async (
    contents: string,
    deckType: DeckType
): Promise<{ mainboard: CardInfo[]; commanders: CardInfo[] }> => {
    const lines = contents.split('\n');
    const commanders: CardInfo[] = [];
    const mainboard: CardInfo[] = [];

    let id = 0;
    const getNextId = (): string => {
        id++;
        return 'card' + id;
    };

    let checkForCommander = deckType === DeckType.Commander;
    for (let line of lines) {
        line = line.trim();
        if (!line) continue;

        const header = checkForHeader(line);
        if (header === Header.Other) continue;
        if (header === Header.Sideboard) break;

        const { quantity, name, set, cn } = parseContentsLine(line);
        for (let i = 0; i < quantity; i++) {
            const card: CardInfo = { id: getNextId(), name, set, cn, commander: false };

            if (checkForCommander) {
                await PopulateCardExternalInfo(card);
                const partner = card.externalInfo!.partner;
                if (commanders.length === 0 || partner) {
                    commanders.push({ ...card, commander: true });
                    checkForCommander = commanders.length < 2 && partner;
                    continue;
                }
                checkForCommander = false;
            }

            mainboard.push(card);
        }
    }

    return { commanders, mainboard };
};

export const GetDeckInfo = async (data: DeckFormData, deckType: DeckType): Promise<DeckInfo> => {
    const { name, url, contents, key } = data;
    const { mainboard, commanders } = await parseContentsToDeck(contents, deckType);

    return {
        ...(key && { key }),
        name: name.trim(),
        url: url.trim(),
        contents,
        mainboard,
        commanders,
    };
};
