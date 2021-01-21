import { ForwardedRef, forwardRef, RefObject, useEffect, useState } from "react";
import { CardInfo } from "../services/dbSvc";
import { Card, CardDragStartEventHandler, CardDragStopEventHandler, DragInfo } from "./card";

export interface ZoneCardInfo {
    card: CardInfo;
    x?: number;
    y?: number;
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

export const useSize = (nodeRef: RefObject<HTMLElement>) => {
    const [size, setSize] = useState([0, 0]);
    useEffect(() => {
        const updateSize = () => {
            const { width, height } = nodeRef.current!.getBoundingClientRect();
            setSize([width, height]);
        };
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, [nodeRef]);
    return size;
};

export const Zone = forwardRef((
    { name, contents, faceDown, enablePreview, drag, onCardDragStart, onCardDragStop }: ZoneProps,
    ref: ForwardedRef<HTMLDivElement>
) => {
    const isTargetZone = drag?.targetZone === name;
    const classes = 'zone' + (isTargetZone ? ' highlight' : '');

    const createCard = (zoneCard: ZoneCardInfo) => {
        const { card, x, y } = zoneCard;
        const transition = 'background-color 0.2s' + (x && y ? '' : ', left 0.1s');
        const style = {
            transition,
            left: x ? x + 'px' : undefined,
            top: y ? y + 'px' : undefined,
        };
        return <Card
            key={card.id}
            info={card}
            style={style}
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
