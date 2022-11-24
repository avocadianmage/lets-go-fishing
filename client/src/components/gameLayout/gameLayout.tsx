import '../css/gameLayout.css';

import { Paper, styled } from '@mui/material';
import shuffle from 'lodash/shuffle';
import React, { useState } from 'react';
import { DeckInfo } from '../../services/dbSvc';
import {
    CARD_HEIGHT_PX,
    CARD_WIDTH_PX,
    STARTING_HAND_SIZE,
    STARTING_LIFE,
    ZONE_BORDER_PX,
    ZONE_PADDING_PX
} from '../../utilities/constants';
import { useGlobalShortcuts } from '../hooks/useKeyDown';
import { Lefter } from '../lefter/lefter';
import { BattlefieldZone } from './battlefieldZone';
import { CardActionInfo } from './draggableCard';
import { LibrarySearch } from './librarySearch';
import { StackZone } from './stackZone';
import { ZoneCardInfo } from './zone';

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
    None = 'none',
    Library = 'library',
    Hand = 'hand',
    Battlefield = 'battlefield',
    Graveyard = 'graveyard',
    Exile = 'exile',
    Command = 'command',
}

interface GameZonesState {
    [ZoneName.None]: ZoneCardInfo[];
    [ZoneName.Library]: ZoneCardInfo[];
    [ZoneName.Hand]: ZoneCardInfo[];
    [ZoneName.Battlefield]: ZoneCardInfo[];
    [ZoneName.Graveyard]: ZoneCardInfo[];
    [ZoneName.Exile]: ZoneCardInfo[];
    [ZoneName.Command]: ZoneCardInfo[];
}

export const GameLayout = () => {
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
        [ZoneName.None]: [],
        [ZoneName.Library]: [],
        [ZoneName.Hand]: [],
        [ZoneName.Battlefield]: [],
        [ZoneName.Graveyard]: [],
        [ZoneName.Exile]: [],
        [ZoneName.Command]: [],
    });
    const [currentAction, setCurrentAction] = useState<CardActionInfo>();
    const [librarySearchOpen, setLibrarySearchOpen] = useState(false);
    const [libraryShuffleAnimationRunning, setLibraryShuffleAnimationRunning] = useState(true);

    const fromLibrary = (action: CardActionInfo) => action.sourceZone === ZoneName.Library;
    const fromBattlefield = (action: CardActionInfo) => action.sourceZone === ZoneName.Battlefield;
    const toBattlefield = (action: CardActionInfo) => action.targetZone === ZoneName.Battlefield;
    const toCommand = (action: CardActionInfo) => action.targetZone === ZoneName.Command;
    const isClick = (action: CardActionInfo) => !action.targetZone;
    const isIntrazoneDrag = (action: CardActionInfo) => action.sourceZone === action.targetZone;
    const isInterzoneDrag = (action: CardActionInfo) => {
        const { sourceZone, targetZone } = action;
        return !!targetZone && targetZone !== sourceZone;
    };

    const getStartingZoneCards = ({ mainboard, commanders }: DeckInfo) => {
        const newLibraryCards = shuffle(mainboard.map((card) => ({ card })));
        const { fromArray, toArray } = sliceEndElements(newLibraryCards, [], STARTING_HAND_SIZE);
        return { library: fromArray, hand: toArray, command: commanders.map((card) => ({ card })) };
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
            [ZoneName.None]: [],
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

    const toggleTap = (action: CardActionInfo) => {
        const zoneCard = findZoneCard(action);
        updateCard({ ...zoneCard, tapped: !zoneCard.tapped }, action);
        return true;
    };

    const takeNextTurn = () => {
        untapAll();
        draw();
    };

    const searchLibrary = (e: KeyboardEvent) => {
        setLibrarySearchOpen(true);
        // Prevent input from proliferating into the search box.
        e.preventDefault();
    };

    useGlobalShortcuts(
        {
            d: drawOne,
            k: searchLibrary,
            n: takeNextTurn,
            r: restartGame,
            s: shuffleLibrary,
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

    const findZoneCard = (action: CardActionInfo) => {
        return gameZonesState[action.sourceZone].find((zc) => zc.card.id === action.card.id)!;
    };

    const getIncrementedZIndex = (zone: ZoneName) => {
        const cards = gameZonesState[zone];
        const highestIndex = cards.some(() => true)
            ? cards.map((zc) => zc.zIndex ?? 0).reduce((prev, curr) => Math.max(prev, curr))
            : 0;
        return highestIndex + 1;
    };

    const updateCardFromAction = (action: CardActionInfo) => {
        const zoneCard = getZoneCardAfterAction(action);
        updateCard(zoneCard, action);
    };

    const getZoneCardAfterAction = (action: CardActionInfo) => {
        const { card, node } = action;
        if (toBattlefield(action) || (fromBattlefield(action) && isClick(action))) {
            const { x, y } = node!.getBoundingClientRect();
            const zoneCard = findZoneCard(action);
            return { ...zoneCard, x: x - ZONE_BORDER_PX, y: y - ZONE_BORDER_PX };
        }
        return { card };
    };

    const updateCard = (zoneCard: ZoneCardInfo, action: CardActionInfo) => {
        const { sourceZone, targetZone } = action;
        if (toBattlefield(action)) {
            const zIndex = getIncrementedZIndex(ZoneName.Battlefield);
            zoneCard = { ...zoneCard, zIndex };
        }

        const [sourceSlice1, sourceSlice2] = sliceCardFromZone(zoneCard, sourceZone);
        if (isClick(action) || isIntrazoneDrag(action)) {
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

            if (action.targetZone === ZoneName.None) return false;

            if (isClick(action)) {
                if (fromLibrary(action)) {
                    draw();
                    return true;
                } else if (fromBattlefield(action)) {
                    updateCardFromAction(action);
                }
                return false;
            }

            const interzoneDrag = isInterzoneDrag(action);
            if (interzoneDrag || (isIntrazoneDrag(action) && fromBattlefield(action))) {
                // Only allow commanders to be moved to the command zone.
                if (toCommand(action) && !action.card.commander) return false;
                updateCardFromAction(action);
            }
            return interzoneDrag;
        } finally {
            setCurrentAction(undefined);
        }
    };

    const onMouseMove = (e: React.MouseEvent) => {
        const mouseOverElems = document.elementsFromPoint(e.clientX, e.clientY);
        const targetElem = mouseOverElems.find((elem) => elem.classList.contains('zone'));
        setCurrentAction((ca) => {
            return ca
                ? { ...ca, targetZone: targetElem ? (targetElem.id as ZoneName) : ZoneName.None }
                : undefined;
        });
    };

    const tutorCard = (zoneCard?: ZoneCardInfo) => {
        setLibrarySearchOpen(false);
        if (!zoneCard) return;
        const [piece1, piece2] = sliceCardFromZone(zoneCard, ZoneName.Library);
        setGameZonesState((g) => ({
            ...g,
            [ZoneName.Library]: shuffle(piece1.concat(piece2)),
            [ZoneName.Hand]: g[ZoneName.Hand].concat(zoneCard),
        }));
        animateShuffle();
    };

    const zoneProps = { action: currentAction, onCardDrag, onCardDragStop };
    return (
        <div className='gameLayout' onMouseMove={onMouseMove}>
            <div className='topPanel'>
                <Lefter
                    gameDetailsState={gameDetailsState}
                    onUpdateGameDetailsState={setGameDetailsState}
                    onDeckSelect={startGame}
                />
                <BattlefieldZone
                    {...zoneProps}
                    name={ZoneName.Battlefield}
                    contents={gameZonesState[ZoneName.Battlefield]}
                    onCardDoubleClick={(action) => toggleTap(action)}
                />
                <StackZone
                    {...zoneProps}
                    name={ZoneName.Graveyard}
                    contents={gameZonesState[ZoneName.Graveyard]}
                    vertical={true}
                />
            </div>
            <div className='bottomPanel'>
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
                />
                <StackZone
                    {...zoneProps}
                    name={ZoneName.Exile}
                    contents={gameZonesState[ZoneName.Exile]}
                    showTopOnly={true}
                />
            </div>
            <LibrarySearch
                contents={gameZonesState[ZoneName.Library]}
                open={librarySearchOpen}
                requestClose={tutorCard}
            />
        </div>
    );
};
