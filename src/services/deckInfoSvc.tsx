import { PopulateCardExternalInfo } from './cardInfoSvc';
import { CardInfo, DeckFormData, DeckInfo } from './dbSvc';

const FoilIndicator = '*F*';
const SideboardIndicator = 'SIDEBOARD:';

const trimParentheses = (str: string): string => str.replace(/[()]/g, '');

const parseContentsLine = (
    line: string
): { quantity: number; name: string; set: string; cn: string } => {
    let pieces: string[] = line.split(' ');
    pieces = line.endsWith(FoilIndicator) ? pieces.slice(0, -1) : pieces;

    const quantity: number = parseInt(pieces[0]);
    const name: string = pieces.slice(1, -2).join(' ');
    const set = trimParentheses(pieces.slice(-2, -1)[0]);
    const [cn] = pieces.slice(-1);
    return { quantity, name, set, cn };
};

const parseContentsToDeck = async (
    contents: string
): Promise<{ mainboard: CardInfo[]; commanders: CardInfo[] }> => {
    const lines = contents.split('\n');
    const commanders: CardInfo[] = [];
    const mainboard: CardInfo[] = [];

    let id = 0;
    const getNextId = (): string => {
        id++;
        return 'card' + id;
    };

    let checkForCommander = true;
    for (let line of lines) {
        line = line.trim();
        if (!line) continue;
        if (line.startsWith(SideboardIndicator)) break;

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

export const GetDeckInfo = async (data: DeckFormData): Promise<DeckInfo> => {
    const { name, url, contents, key } = data;
    const { mainboard, commanders } = await parseContentsToDeck(contents);

    return {
        ...(key && { key }),
        name: name.trim(),
        url: url.trim(),
        contents,
        mainboard,
        commanders,
    };
};
