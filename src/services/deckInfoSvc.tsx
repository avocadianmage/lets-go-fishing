import { DeckType } from '../components/lefter/deckEditModal';
import { PopulateCardExternalInfo } from './cardInfoSvc';
import { CardInfo, DeckFormData, DeckInfo } from './dbSvc';

//ckgtest clean up to remove this enum and just check for SIDEBOARD
enum Header {
    Sideboard = 'SIDEBOARD',
    Maybeboard = 'MAYBEBOARD',
    Commander = 'COMMANDER',
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

const removeAndGetMetadata = (line: string): { metadata: string; lineWithoutMetadata: string } => {
    line = line.trim();
    const CategoryIndicator = '[';
    const FoilIndicator = '*';

    let metadata = '';
    let metadataStartIndex = line.indexOf(CategoryIndicator);
    if (metadataStartIndex > -1) {
        // Remove leading bracket from metadata.
        metadata = line.slice(metadataStartIndex + 1).trim();
        line = line.slice(0, metadataStartIndex).trim();
    }

    // Parse for foil indicator after parsing and removing other metadata.
    metadataStartIndex = line.indexOf(FoilIndicator);
    if (metadataStartIndex > -1) {
        line = line.slice(0, metadataStartIndex).trim();
    }

    return { metadata, lineWithoutMetadata: line };
};

// 'commander' param: True/False if definitely a commander/not, undefined if not sure.
const parseContentsLine = (
    line: string
): { quantity: number; name: string; set: string; cn: string; commander?: boolean } => {
    const { metadata, lineWithoutMetadata } = removeAndGetMetadata(line);
    let pieces: string[] = lineWithoutMetadata.split(' ').filter((piece) => piece !== '');

    // Process and remove card category in brackets at the end of the line if it exists.
    let commander: boolean | undefined;
    if (metadata) {
        const header = checkForHeader(metadata)!;
        // Ignore sideboard and maybeboard cards.
        if (header === Header.Sideboard || header === Header.Maybeboard) {
            return { quantity: 0, name: '', set: '', cn: '', commander: false };
        }
        commander = header === Header.Commander;
    }

    // Trim the 'x' at the end if it exists.
    const quantity: number = parseInt(pieces[0].replace(/x$/, ''));

    const name: string = pieces.slice(1, -2).join(' ');

    // Trim parentheses from set name if they exist.
    const set = pieces.slice(-2, -1)[0].replace(/[()]/g, '');

    // Collector number is case sensitive.
    const cn = pieces.slice(-1)[0];

    return { quantity, name, set, cn, commander };
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
        if (header === Header.Sideboard) break;
        if (header !== undefined) continue;

        const { quantity, name, set, cn, commander } = parseContentsLine(line);
        for (let i = 0; i < quantity; i++) {
            const card: CardInfo = {
                id: getNextId(),
                name,
                set,
                cn,
                commander: commander ?? false,
            };
            if (commander === true) {
                commanders.push(card);
                continue;
            }

            if (checkForCommander && commander === undefined) {
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
