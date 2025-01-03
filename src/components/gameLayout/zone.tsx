import { ForwardedRef, forwardRef } from 'react';
import { CardInfo } from '../../services/dbSvc';
import { DraggableCard } from './draggableCard';
import { CurrentDragInfo, ZoneName } from './gameLayout';
import { Pane } from '../controls/pane';

export interface ZoneCardInfo {
    card: CardInfo;
    tapped: boolean;
    transformed: boolean;
    counters: number;
    node?: Element;
    x?: number;
    y?: number;
    zIndex?: number;
    previewing?: boolean;
}

export interface ZoneProps {
    name: ZoneName;
    contents: ZoneCardInfo[];
    classesToAppend?: string;
    faceDown?: boolean;
    wiggleCards?: boolean;
    currentDrag?: CurrentDragInfo;
    currentDragTargetZone?: ZoneName;
    onCardDrag?: CardActionEventHandler;
    onCardDragStop?: CardActionEventHandler;
    onCardMouseEnter?: CardActionEventHandler;
    onCardMouseLeave?: CardActionEventHandler;
    onCardClick?: CardActionEventHandler;
    onCardDoubleClick?: CardActionEventHandler;
}

export type CardActionEventHandler = (action: CurrentDragInfo) => boolean;

export const Zone = forwardRef(
    (
        {
            name,
            contents,
            classesToAppend,
            faceDown,
            wiggleCards,
            currentDrag,
            currentDragTargetZone,
            onCardDrag,
            onCardDragStop,
            onCardMouseEnter,
            onCardMouseLeave,
            onCardClick,
            onCardDoubleClick,
        }: ZoneProps,
        ref: ForwardedRef<HTMLDivElement>
    ) => {
        const isSourceZone = name === currentDrag?.sourceZone;
        const isTargetZone = name === currentDragTargetZone;
        const className =
            'zone' +
            (classesToAppend ? ' ' + classesToAppend : '') +
            (isTargetZone ? ' highlight' : '');

        const isCardDragging = (card: CardInfo) => card.id === currentDrag?.zoneCard.card.id;
        const updatedContents = contents.map((zc) => ({
            ...zc,
            zIndex: isCardDragging(zc.card) ? Number.MAX_SAFE_INTEGER : zc.zIndex,
        }));

        const fireAction = (zoneCard: ZoneCardInfo, handler?: CardActionEventHandler) =>
            handler ? handler({ zoneCard, sourceZone: name }) : true;
        return (
            <Pane
                ref={ref}
                id={name}
                className={className}
                data-name={name.toUpperCase()}
                sx={{ zIndex: isSourceZone ? 1 : 0 }}
            >
                {updatedContents.map((zc, index) => (
                    <DraggableCard
                        key={zc.card.id}
                        zoneCard={zc}
                        faceDown={faceDown}
                        wiggle={index === updatedContents.length - 1 ? wiggleCards : false}
                        onDrag={(action) => fireAction(action, onCardDrag)}
                        onDragStop={(action) => fireAction(action, onCardDragStop)}
                        onMouseEnter={(action) => fireAction(action, onCardMouseEnter)}
                        onMouseLeave={(action) => fireAction(action, onCardMouseLeave)}
                        onClick={(action) => fireAction(action, onCardClick)}
                        onDoubleClick={(action) => fireAction(action, onCardDoubleClick)}
                    />
                ))}
            </Pane>
        );
    }
);
