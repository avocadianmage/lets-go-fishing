import { ForwardedRef, forwardRef, RefObject, useEffect, useState } from "react";
import { CardInfo } from "../../services/dbSvc";
import { Card, CardDragStartEventHandler, CardDragStopEventHandler, DragInfo } from "./card";

export interface ZoneCardInfo {
    card: CardInfo;
    x?: number;
    y?: number;
    tapped?: boolean;
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
    const isTargetZone = drag?.targetZone === name;
    const classes = 'zone' + (isTargetZone ? ' highlight' : '');

    const createCard = (zoneCard: ZoneCardInfo) => {
        return <Card
            key={zoneCard.card.id}
            zoneCard={zoneCard}
            faceDown={faceDown}
            enablePreview={enablePreview}
            onDragStart={drag => onCardDragStart({ ...drag, sourceZone: name })}
            onDragStop={onCardDragStop}
        />;
    }

    return (
        <div
            ref={ref}
            id={name}
            className={classes}
            data-name={name.toUpperCase()}
        >
            {contents.map(createCard)}
        </div>
    );
});
