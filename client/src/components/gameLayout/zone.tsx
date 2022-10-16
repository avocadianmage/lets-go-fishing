import { ForwardedRef, forwardRef } from 'react';
import { CardInfo } from '../../services/dbSvc';
import { Card, CardActionEventHandler, CardActionInfo } from './card';
import { ZoneName } from './gameLayout';

export interface ZoneCardInfo {
    card: CardInfo;
    x?: number;
    y?: number;
    zIndex?: number;
    previewing?: boolean;
    zoneName?: ZoneName;
}

export interface ZoneProps {
    name: ZoneName;
    contents: ZoneCardInfo[];
    classesToAppend?: string;
    faceDown?: boolean;
    action?: CardActionInfo;
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
            onCardDrag,
            onCardDragStop,
            onCardMouseEnter,
            onCardMouseLeave,
            onCardDoubleClick
        }: ZoneProps,
        ref: ForwardedRef<HTMLDivElement>
    ) => {
        const isSourceZone = action?.sourceZone === name;
        const isTargetZone = action?.targetZone === name;
        const className =
            'pane zone' +
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
            <div
                ref={ref}
                id={name}
                className={className}
                data-name={name.toUpperCase()}
                style={{ zIndex: isSourceZone ? 1 : 0 }}
            >
                {updatedContents.map((zc) => (
                    <Card
                        key={zc.card.id}
                        zoneCard={{ ...zc, zoneName: name }}
                        faceDown={faceDown}
                        onDrag={(action) => fireAction(action, onCardDrag)}
                        onDragStop={(action) => fireAction(action, onCardDragStop)}
                        onMouseEnter={(action) => fireAction(action, onCardMouseEnter)}
                        onMouseLeave={(action) => fireAction(action, onCardMouseLeave)}
                        onDoubleClick={(action) => fireAction(action, onCardDoubleClick)}
                    />
                ))}
            </div>
        );
    }
);
