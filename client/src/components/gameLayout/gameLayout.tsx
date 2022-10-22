import '../css/gameLayout.css';

import shuffle from 'lodash/shuffle';
import React, { useCallback, useEffect, useState } from 'react';
import { DeckInfo } from '../../services/dbSvc';
import { STARTING_HAND_SIZE, ZONE_BORDER_PX } from '../../utilities/constants';
import { CardActionInfo } from './card';
import { ZoneCardInfo } from './zone';
import { StackZone } from './stackZone';
import { BattlefieldZone } from './battlefieldZone';
import { Lefter } from '../lefter/lefter';
import { LibrarySearch } from './librarySearch';

export enum ZoneName {
    None = 'none',
    Library = 'library',
    Hand = 'hand',
    Battlefield = 'battlefield',
    Graveyard = 'graveyard',
    Exile = 'exile',
    Command = 'command',
}

interface GameState {
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
    const [gameState, setGameState] = useState<GameState>({
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

    const startGame = (deckInfo?: DeckInfo) => {
        deckInfo = deckInfo ?? currentDeckInfo;
        setCurrentDeckInfo(deckInfo);
        const { library, hand, command } = deckInfo
            ? getStartingZoneCards(deckInfo)
            : { library: [], hand: [], command: [] };
        setGameState({
            ...gameState,
            [ZoneName.Library]: library,
            [ZoneName.Hand]: hand,
            [ZoneName.Battlefield]: [],
            [ZoneName.Graveyard]: [],
            [ZoneName.Exile]: [],
            [ZoneName.Command]: command,
        });
    };

    const draw = useCallback(
        (num = 1) => {
            const { fromArray, toArray } = sliceEndElements(
                gameState[ZoneName.Library],
                gameState[ZoneName.Hand],
                num
            );
            setGameState((g) => ({
                ...g,
                [ZoneName.Library]: fromArray,
                [ZoneName.Hand]: toArray,
            }));
        },
        [gameState]
    );

    const untapAll = useCallback(() => {
        setGameState((g) => ({
            ...g,
            [ZoneName.Battlefield]: gameState[ZoneName.Battlefield].map((zc) => ({
                ...zc,
                tapped: false,
            })),
        }));
    }, [gameState]);

    const toggleTap = (action: CardActionInfo) => {
        const zoneCard = findZoneCard(action);
        updateCard({ ...zoneCard, tapped: !zoneCard.tapped }, action);
        return true;
    };

    const handleKeyDown = useCallback(
        (event: { key: any; preventDefault: any }) => {
            // Only process keyboard shortcuts if nothing is focused or being dragged.
            if (currentAction || document.activeElement!.tagName !== 'BODY') return;

            switch (event.key) {
                // Next turn.
                case 'n':
                    untapAll();
                    draw();
                    break;

                // Restart game.
                case 'r':
                    startGame();
                    break;

                // Search library.
                case 'k':
                    setLibrarySearchOpen(true);
                    // Prevent input from proliferating into the search box.
                    event.preventDefault();
                    break;
            }
        },
        [gameState, currentAction]
    );

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const sliceEndElements = (fromArray: any[], toArray: any[], num: number) => {
        const cutIndex = fromArray.length - num;
        return {
            fromArray: fromArray.slice(0, cutIndex),
            toArray: toArray.concat(fromArray.slice(cutIndex)),
        };
    };

    const sliceCardFromZone = (zoneCard: ZoneCardInfo, zone: ZoneName) => {
        const cards = gameState[zone];
        const index = cards.findIndex((zc) => zc.card.id === zoneCard.card.id);
        return [cards.slice(0, index), cards.slice(index + 1)];
    };

    const findZoneCard = (action: CardActionInfo) => {
        return gameState[action.sourceZone].find((zc) => zc.card.id === action.card.id)!;
    };

    const getIncrementedZIndex = (zone: ZoneName) => {
        const cards = gameState[zone];
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
            setGameState({ ...gameState, [sourceZone]: sourceZoneCards });
            return;
        }

        const sourceZoneCards = sourceSlice1.concat(sourceSlice2);
        const targetZoneCards = gameState[targetZone!].concat(zoneCard);
        setGameState({
            ...gameState,
            [sourceZone]: sourceZoneCards,
            [targetZone!]: targetZoneCards,
        });
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
        if (!currentAction) return;
        const mouseOverElems = document.elementsFromPoint(e.clientX, e.clientY);
        const targetElem = mouseOverElems.find((elem) => elem.classList.contains('zone'));
        setCurrentAction({
            ...currentAction,
            targetZone: targetElem ? (targetElem.id as ZoneName) : ZoneName.None,
        });
    };

    const zoneProps = { action: currentAction, onCardDrag, onCardDragStop };
    return (
        <div className='gameLayout' onMouseMove={onMouseMove}>
            <div className='topPanel'>
                <Lefter onDeckSelect={(di) => startGame(di)} />
                <BattlefieldZone
                    {...zoneProps}
                    name={ZoneName.Battlefield}
                    contents={gameState[ZoneName.Battlefield]}
                    onCardDoubleClick={(action) => toggleTap(action)}
                />
                <StackZone
                    {...zoneProps}
                    name={ZoneName.Graveyard}
                    contents={gameState[ZoneName.Graveyard]}
                    vertical={true}
                />
            </div>
            <div className='bottomPanel'>
                <StackZone
                    {...zoneProps}
                    name={ZoneName.Command}
                    contents={gameState[ZoneName.Command]}
                />
                <StackZone
                    {...zoneProps}
                    name={ZoneName.Hand}
                    contents={gameState[ZoneName.Hand]}
                />
                <StackZone
                    {...zoneProps}
                    name={ZoneName.Library}
                    contents={gameState[ZoneName.Library]}
                    faceDown={true}
                    showTopOnly={true}
                />
                <StackZone
                    {...zoneProps}
                    name={ZoneName.Exile}
                    contents={gameState[ZoneName.Exile]}
                    showTopOnly={true}
                />
            </div>
            <LibrarySearch
                contents={gameState[ZoneName.Library]}
                open={librarySearchOpen}
                requestClose={() => setLibrarySearchOpen(false)}
            />
        </div>
    );
};
