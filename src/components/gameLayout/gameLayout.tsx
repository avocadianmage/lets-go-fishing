import { Paper, styled } from '@mui/material';
import shuffle from 'lodash/shuffle';
import { useRef, useState } from 'react';
import {
    CARD_HEIGHT_PX,
    CARD_WIDTH_PX,
    STARTING_HAND_SIZE,
    STARTING_LIFE,
    ZONE_BORDER_PX,
    ZONE_PADDING_PX,
} from '../../global/constants';
import { DeckInfo } from '../../services/dbSvc';
import { Lefter } from '../lefter/lefter';
import { useGlobalShortcuts } from '../hooks/useKeyDown';
import { BattlefieldZone } from './battlefieldZone';
import { CardActionInfo } from './draggableCard';
import { SearchZone } from './searchZone';
import { StackZone } from './stackZone';
import { ZoneCardInfo } from './zone';
import useMousePosition from '../hooks/useMousePosition';

export const Pane = styled(Paper)(() => ({
    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.11))',
    minWidth: CARD_WIDTH_PX,
    minHeight: CARD_HEIGHT_PX,
    position: 'relative',
    margin: ZONE_BORDER_PX,
    padding: ZONE_PADDING_PX,
}));

export enum ManaColor {
    White = 'White',
    Blue = 'Blue',
    Black = 'Black',
    Red = 'Red',
    Green = 'Green',
    Colorless = 'Colorless',
}

export interface GameDetailsState {
    life: number;
    [ManaColor.White]: number;
    [ManaColor.Blue]: number;
    [ManaColor.Black]: number;
    [ManaColor.Red]: number;
    [ManaColor.Green]: number;
    [ManaColor.Colorless]: number;
}

export enum ZoneName {
    Library = 'library',
    Hand = 'hand',
    Battlefield = 'battlefield',
    Graveyard = 'graveyard',
    Exile = 'exile',
    Command = 'command',
}

interface GameZonesState {
    [ZoneName.Library]: ZoneCardInfo[];
    [ZoneName.Hand]: ZoneCardInfo[];
    [ZoneName.Battlefield]: ZoneCardInfo[];
    [ZoneName.Graveyard]: ZoneCardInfo[];
    [ZoneName.Exile]: ZoneCardInfo[];
    [ZoneName.Command]: ZoneCardInfo[];
}

export const GameLayout = () => {
    const contentDiv = useRef<HTMLDivElement>(null);
    const mousePositionInContent = useMousePosition(contentDiv);

    const [currentDeckInfo, setCurrentDeckInfo] = useState<DeckInfo>();
    const [gameDetailsState, setGameDetailsState] = useState<GameDetailsState>({
        life: 0,
        [ManaColor.White]: 0,
        [ManaColor.Blue]: 0,
        [ManaColor.Black]: 0,
        [ManaColor.Green]: 0,
        [ManaColor.Red]: 0,
        [ManaColor.Colorless]: 0,
    });
    const [gameZonesState, setGameZonesState] = useState<GameZonesState>({
        [ZoneName.Library]: [],
        [ZoneName.Hand]: [],
        [ZoneName.Battlefield]: [],
        [ZoneName.Graveyard]: [],
        [ZoneName.Exile]: [],
        [ZoneName.Command]: [],
    });
    const [currentAction, setCurrentAction] = useState<CardActionInfo>();
    const [searchingZone, setSearchingZone] = useState<ZoneName>();
    const [libraryShuffleAnimationRunning, setLibraryShuffleAnimationRunning] = useState(true);

    const fromBattlefield = (action: CardActionInfo) => action.sourceZone === ZoneName.Battlefield;
    const toBattlefield = (action: CardActionInfo) => action.targetZone === ZoneName.Battlefield;
    const toCommand = (action: CardActionInfo) => action.targetZone === ZoneName.Command;
    const isIntrazoneDrag = (action: CardActionInfo) => {
        const { sourceZone, targetZone } = action;
        return targetZone === sourceZone || targetZone === undefined;
    };
    const isInterzoneDrag = (action: CardActionInfo) => {
        const { sourceZone, targetZone } = action;
        return !!targetZone && targetZone !== sourceZone;
    };

    const getStartingZoneCards = ({ mainboard, commanders }: DeckInfo) => {
        const newLibraryCards = shuffle(mainboard.map((card) => ({ card })));
        const { fromArray, toArray } = sliceEndElements(newLibraryCards, [], STARTING_HAND_SIZE);
        return {
            library: fromArray,
            hand: toArray,
            command: commanders.map((card) => ({ card })),
        };
    };

    const animateShuffle = () => {
        setLibraryShuffleAnimationRunning(true);
        setTimeout(() => setLibraryShuffleAnimationRunning(false), 300);
    };

    const restartGame = () => startGame(currentDeckInfo);
    const startGame = (deckInfo?: DeckInfo) => {
        setCurrentDeckInfo(deckInfo);
        setGameDetailsState({
            life: STARTING_LIFE,
            [ManaColor.White]: 0,
            [ManaColor.Blue]: 0,
            [ManaColor.Black]: 0,
            [ManaColor.Green]: 0,
            [ManaColor.Red]: 0,
            [ManaColor.Colorless]: 0,
        });
        const { library, hand, command } = deckInfo
            ? getStartingZoneCards(deckInfo)
            : { library: [], hand: [], command: [] };
        setGameZonesState({
            [ZoneName.Library]: library,
            [ZoneName.Hand]: hand,
            [ZoneName.Battlefield]: [],
            [ZoneName.Graveyard]: [],
            [ZoneName.Exile]: [],
            [ZoneName.Command]: command,
        });
        animateShuffle();
    };

    const drawOne = () => draw();
    const draw = (num = 1) => {
        const { fromArray, toArray } = sliceEndElements(
            gameZonesState[ZoneName.Library],
            gameZonesState[ZoneName.Hand],
            num
        );
        setGameZonesState((g) => ({
            ...g,
            [ZoneName.Library]: fromArray,
            [ZoneName.Hand]: toArray,
        }));
        return true;
    };

    const shuffleLibrary = () => {
        setGameZonesState((g) => ({
            ...g,
            [ZoneName.Library]: shuffle(g[ZoneName.Library]),
        }));
        animateShuffle();
    };

    const untapAll = () => {
        setGameZonesState((g) => ({
            ...g,
            [ZoneName.Battlefield]: g[ZoneName.Battlefield].map((zc) => ({
                ...zc,
                tapped: false,
            })),
        }));
    };

    const takeNextTurn = () => {
        untapAll();
        draw();
    };

    const getHoveredZoneAndCard = () => {
        if (!mousePositionInContent) return undefined;
        const hoveredElems = document.elementsFromPoint(
            mousePositionInContent.x,
            mousePositionInContent.y
        );

        const getElem = (className: string) => {
            return hoveredElems.find((elem) => elem.classList.contains(className));
        };

        const zoneElem = getElem('zone');
        const zone = zoneElem ? (zoneElem.id as ZoneName) : undefined;
        if (!zone) return undefined;

        const hoveredCardId = getElem('card')?.id;
        const zoneCard =
            hoveredCardId !== undefined
                ? gameZonesState[zone].find((zc) => zc.card.id === hoveredCardId)
                : undefined;

        return { zone, zoneCard };
    };

    const tapHoveredCard = () => {
        const hoveredZoneAndCard = getHoveredZoneAndCard();
        if (!hoveredZoneAndCard || !hoveredZoneAndCard.zoneCard) return undefined;
        const { zone, zoneCard } = hoveredZoneAndCard;

        if (zone !== ZoneName.Battlefield) return;
        toggleTap({ zoneCard, sourceZone: zone });
    };

    const toggleTap = (action: CardActionInfo) => {
        const zoneCard = findZoneCard(action);
        updateCard({ ...zoneCard, tapped: !zoneCard.tapped }, action);
        return true;
    };

    const putCardOnLibraryBottom = () => {
        const hoveredZoneAndCard = getHoveredZoneAndCard();
        if (!hoveredZoneAndCard || !hoveredZoneAndCard.zoneCard) return undefined;
        const { zone, zoneCard } = hoveredZoneAndCard;

        const [piece1, piece2] = sliceCardFromZone(zoneCard, zone);
        if (zone === ZoneName.Library) {
            const libraryCards = [zoneCard].concat(piece1, piece2);
            setGameZonesState((g) => ({ ...g, [ZoneName.Library]: libraryCards }));
        } else {
            const libraryCards = [zoneCard].concat(gameZonesState[ZoneName.Library]);
            setGameZonesState((g) => ({
                ...g,
                [ZoneName.Library]: libraryCards,
                [zone]: piece1.concat(piece2),
            }));
        }
        updateZoneCardAfterAction({ zoneCard, sourceZone: zone, targetZone: ZoneName.Library });
    };

    const searchZone = (zone: ZoneName, e: KeyboardEvent) => {
        setSearchingZone(zone);
        // Prevent input from proliferating into the search box.
        e.preventDefault();
    };
    const searchExile = (e: KeyboardEvent) => searchZone(ZoneName.Exile, e);
    const searchGraveyard = (e: KeyboardEvent) => searchZone(ZoneName.Graveyard, e);
    const searchHand = (e: KeyboardEvent) => searchZone(ZoneName.Hand, e);
    const searchLibrary = (e: KeyboardEvent) => searchZone(ZoneName.Library, e);

    useGlobalShortcuts(
        {
            b: putCardOnLibraryBottom,
            d: drawOne,
            e: searchExile,
            g: searchGraveyard,
            h: searchHand,
            l: searchLibrary,
            n: takeNextTurn,
            r: restartGame,
            s: shuffleLibrary,
            t: tapHoveredCard,
            u: untapAll,
        },
        () => currentAction === undefined
    );

    const sliceEndElements = (fromArray: any[], toArray: any[], num: number) => {
        const cutIndex = fromArray.length - num;
        return {
            fromArray: fromArray.slice(0, cutIndex),
            toArray: toArray.concat(fromArray.slice(cutIndex)),
        };
    };

    const sliceCardFromZone = (zoneCard: ZoneCardInfo, zone: ZoneName) => {
        const cards = gameZonesState[zone];
        const index = cards.findIndex((zc) => zc.card.id === zoneCard.card.id);
        return [cards.slice(0, index), cards.slice(index + 1)];
    };

    const findZoneCard = (action: CardActionInfo): ZoneCardInfo => {
        return gameZonesState[action.sourceZone].find(
            (zc) => zc.card.id === action.zoneCard.card.id
        )!;
    };

    const getIncrementedZIndex = (zone: ZoneName) => {
        const cards = gameZonesState[zone];
        const highestIndex = cards.some(() => true)
            ? cards.map((zc) => zc.zIndex ?? 0).reduce((prev, curr) => Math.max(prev, curr))
            : 0;
        return highestIndex + 1;
    };

    const updateZoneCardAfterAction = (action: CardActionInfo) => {
        const { card, node } = action.zoneCard;
        let zoneCard: ZoneCardInfo = { card };
        if (toBattlefield(action)) {
            const { x, y } = node!.getBoundingClientRect();
            zoneCard = findZoneCard(action);
            zoneCard = { ...zoneCard, x: x - ZONE_BORDER_PX, y: y - ZONE_BORDER_PX };
        }
        updateCard(zoneCard, action);
    };

    const updateCard = (zoneCard: ZoneCardInfo, action: CardActionInfo) => {
        const { sourceZone, targetZone } = action;
        if (toBattlefield(action)) {
            const zIndex = getIncrementedZIndex(ZoneName.Battlefield);
            zoneCard = { ...zoneCard, zIndex };
        }

        const [sourceSlice1, sourceSlice2] = sliceCardFromZone(zoneCard, sourceZone);
        if (isIntrazoneDrag(action)) {
            const sourceZoneCards = sourceSlice1.concat(zoneCard).concat(sourceSlice2);
            setGameZonesState((g) => ({ ...g, [sourceZone]: sourceZoneCards }));
            return;
        }

        const sourceZoneCards = sourceSlice1.concat(sourceSlice2);
        const targetZoneCards = gameZonesState[targetZone!].concat(zoneCard);
        setGameZonesState((g) => ({
            ...g,
            [sourceZone]: sourceZoneCards,
            [targetZone!]: targetZoneCards,
        }));
    };

    const onCardDrag = (action: CardActionInfo) => {
        if (!currentAction) setCurrentAction(action);
        return true;
    };

    const onCardDragStop = (action: CardActionInfo) => {
        try {
            action = currentAction ?? action;

            action.targetZone = getHoveredZoneAndCard()?.zone;
            if (!action.targetZone) return false;

            const interzoneDrag = isInterzoneDrag(action);
            if (interzoneDrag || (isIntrazoneDrag(action) && fromBattlefield(action))) {
                // Only allow commanders to be moved to the command zone.
                if (toCommand(action) && !action.zoneCard.card.commander) return false;
                updateZoneCardAfterAction(action);
            }
            return interzoneDrag;
        } finally {
            setCurrentAction(undefined);
        }
    };

    const retrieveCard = (zoneCard?: ZoneCardInfo) => {
        const fromZone = searchingZone;
        const toZone = ZoneName.Hand;
        const isSameZone = fromZone === toZone;
        setSearchingZone(undefined);

        if (!zoneCard || !fromZone) return;
        setGameZonesState((g) => {
            const [piece1, piece2] = sliceCardFromZone(zoneCard, fromZone);
            const fromZoneContents = piece1.concat(piece2);
            const toZoneContents = (isSameZone ? fromZoneContents : g[toZone]).concat(zoneCard);
            return { ...g, [fromZone]: fromZoneContents, [toZone]: toZoneContents };
        });

        if (fromZone === ZoneName.Library) shuffleLibrary();
    };

    const zoneProps = { action: currentAction, onCardDrag, onCardDragStop };
    return (
        <div ref={contentDiv} className='gameLayout'>
            <div style={{ display: 'flex', flex: 1 }}>
                <Lefter
                    gameDetailsState={gameDetailsState}
                    onUpdateGameDetailsState={setGameDetailsState}
                    onDeckSelect={startGame}
                />
                <BattlefieldZone
                    {...zoneProps}
                    name={ZoneName.Battlefield}
                    contents={gameZonesState[ZoneName.Battlefield]}
                    onCardDoubleClick={toggleTap}
                />
                <StackZone
                    {...zoneProps}
                    name={ZoneName.Graveyard}
                    contents={gameZonesState[ZoneName.Graveyard]}
                    vertical={true}
                />
            </div>
            <div style={{ display: 'flex' }}>
                <StackZone
                    {...zoneProps}
                    name={ZoneName.Command}
                    contents={gameZonesState[ZoneName.Command]}
                />
                <StackZone
                    {...zoneProps}
                    name={ZoneName.Hand}
                    contents={gameZonesState[ZoneName.Hand]}
                />
                <StackZone
                    {...zoneProps}
                    name={ZoneName.Library}
                    contents={gameZonesState[ZoneName.Library]}
                    faceDown={true}
                    showTopOnly={true}
                    wiggleCards={libraryShuffleAnimationRunning}
                    onCardClick={drawOne}
                />
                <StackZone
                    {...zoneProps}
                    name={ZoneName.Exile}
                    contents={gameZonesState[ZoneName.Exile]}
                    showTopOnly={true}
                />
            </div>
            <SearchZone
                zone={searchingZone}
                contents={searchingZone ? gameZonesState[searchingZone] : []}
                requestClose={retrieveCard}
            />
        </div>
    );
};
