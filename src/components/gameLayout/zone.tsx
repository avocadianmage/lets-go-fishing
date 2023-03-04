import { ForwardedRef, forwardRef } from 'react';
import { CardInfo } from '../../services/dbSvc';
import { CardActionEventHandler, CardActionInfo, DraggableCard } from './draggableCard';
import { Pane, ZoneName } from './gameLayout';

export interface ZoneCardInfo {
    card: CardInfo;
    x?: number;
    y?: number;
    zIndex?: number;
    previewing?: boolean;
    tapped?: boolean;
}

export interface ZoneProps {
    name: ZoneName;
    contents: ZoneCardInfo[];
    classesToAppend?: string;
    faceDown?: boolean;
    action?: CardActionInfo;
    wiggleCards?: boolean;
    onCardDrag?: CardActionEventHandler;
    onCardDragStop?: CardActionEventHandler;
    onCardMouseEnter?: CardActionEventHandler;
    onCardMouseLeave?: CardActionEventHandler;
    onCardDoubleClick?: CardActionEventHandler;
}

export const Zone = forwardRef(
    (
        {
            name,
            contents,
            classesToAppend,
            faceDown,
            action,
            wiggleCards,
            onCardDrag,
            onCardDragStop,
            onCardMouseEnter,
            onCardMouseLeave,
            onCardDoubleClick,
        }: ZoneProps,
        ref: ForwardedRef<HTMLDivElement>
    ) => {
        const isSourceZone = action?.sourceZone === name;
        const isTargetZone = action?.targetZone === name;
        const className =
            'zone' +
            (classesToAppend ? ' ' + classesToAppend : '') +
            (isTargetZone ? ' highlight' : '');

        const isCardDragging = (card: CardInfo) => card.id === action?.card.id;
        const updatedContents = contents.map((zc) => ({
            ...zc,
            zIndex: isCardDragging(zc.card) ? Number.MAX_SAFE_INTEGER : zc.zIndex,
        }));

        const fireAction = (action: CardActionInfo, handler?: CardActionEventHandler) =>
            handler ? handler({ ...action, sourceZone: name }) : true;
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
                        onDoubleClick={(action) => fireAction(action, onCardDoubleClick)}
                    />
                ))}
            </Pane>
        );
    }
);