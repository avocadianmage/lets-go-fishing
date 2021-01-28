import { ForwardedRef, forwardRef, RefObject, useEffect, useState } from "react";
import { CardInfo } from "../../services/dbSvc";
import { Card, CardDragStartEventHandler, CardDragStopEventHandler, DragInfo } from "./card";

export interface ZoneCardInfo {
    card: CardInfo;
    x?: number;
    y?: number;
    tapped?: boolean;
    zIndex?: number;
}

export interface ZoneProps {
    name: string;
    contents: ZoneCardInfo[];
    faceDown?: boolean;
    enablePreview?: boolean;
    drag?: DragInfo;
    onCardDragStart: CardDragStartEventHandler;
    onCardDragStop: CardDragStopEventHandler;
}

export const useRect = (nodeRef: RefObject<HTMLElement>) => {
    const [rect, setRect] = useState<DOMRect>(new DOMRect());
    useEffect(() => {
        const updateRect = () => setRect(nodeRef.current!.getBoundingClientRect());
        window.addEventListener('resize', updateRect);
        updateRect();
        return () => window.removeEventListener('resize', updateRect);
    }, [nodeRef]);
    return rect;
};

export const Zone = forwardRef((
    { name, contents, faceDown, enablePreview, drag, onCardDragStart, onCardDragStop }: ZoneProps,
    ref: ForwardedRef<HTMLDivElement>
) => {
    const isSourceZone = drag?.sourceZone === name;
    const isTargetZone = drag?.targetZone === name;
    const classes = 'zone' + (isTargetZone ? ' highlight' : '');

    const isCardDragging = (card: CardInfo) => card.id === drag?.card.id;
    const updatedContents = contents.map(zc => ({
        ...zc, zIndex: isCardDragging(zc.card) ? Number.MAX_SAFE_INTEGER : zc.zIndex
    }));

    return (
        <div
            ref={ref}
            id={name}
            className={classes}
            data-name={name.toUpperCase()}
            style={{ zIndex: isSourceZone ? 1 : 0 }}
        >
            {updatedContents.map(zc => (
                <Card
                    key={zc.card.id}
                    zoneCard={zc}
                    faceDown={faceDown}
                    enablePreview={enablePreview}
                    onDragStart={drag => onCardDragStart({ ...drag, sourceZone: name })}
                    onDragStop={onCardDragStop}
                />
            ))}
        </div>
    );
});
