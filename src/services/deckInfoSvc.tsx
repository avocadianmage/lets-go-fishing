import { CardInfo, DeckInfo } from './dbSvc';

export interface DeckFormData {
    name: string;
    url: string;
    contents: string;
}

const trimParentheses = (str: string): string => str.replace(/[()]/g, '');

const parseContentsLine = (
    line: string
): { quantity: number; name: string; set: string; cn: string } => {
    const FoilIndicator = ' *F*';
    let pieces: string[] = line.split(' ');
    pieces = line.endsWith(FoilIndicator) ? pieces.slice(0, -1) : pieces;

    const quantity: number = parseInt(pieces[0]);
    const name: string = pieces.slice(1, -2).join(' ');
    const set = trimParentheses(pieces.slice(-2, -1)[0]);
    const [cn] = pieces.slice(-1);
    return { quantity, name, set, cn };
};

const parseContentsToDeck = (
    contents: string
): { mainboard: CardInfo[]; commanders: CardInfo[] } => {
    const lines = contents.split('\n');
    const commanders: CardInfo[] = [];
    const mainboard: CardInfo[] = [];

    let id = 0;
    const getNextId = (): string => {
        id++;
        return 'card' + id;
    };

    let commander = true;
    for (let line of lines) {
        line = line.trim();
        if (!line) continue;
        if (line.startsWith('SIDEBOARD:')) break;

        const { quantity, name, set, cn } = parseContentsLine(line);
        for (let i = 0; i < quantity; i++) {
            const card: CardInfo = { id: getNextId(), name, set, cn, commander };
            if (commander) commanders.push(card);
            else mainboard.push(card);
        }
        commander = false;
    }

    return { commanders, mainboard };
};

export const GetDeckInfo = (data: DeckFormData): DeckInfo => {
    const { name, url } = data;
    const { mainboard, commanders } = parseContentsToDeck(data.contents);
    return { name, url, mainboard, commanders };
};
