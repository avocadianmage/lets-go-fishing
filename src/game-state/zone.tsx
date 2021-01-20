import { useEffect, useState } from "react";
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
    containerRef: React.RefObject<HTMLDivElement>;
    faceDown?: boolean;
    enablePreview?: boolean;
    drag?: DragInfo;
    onCardDragStart: CardDragStartEventHandler;
    onCardDragStop: CardDragStopEventHandler;
}

export const useSize = (nodeRef: React.RefObject<HTMLElement>) => {
    const [size, setSize] = useState([0, 0]);
    useEffect(() => {
        const updateSize = () => {
            const rect = nodeRef.current!.getBoundingClientRect();
            setSize([rect.width, rect.height]);
        };
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    });
    return size;
};

export const Zone = ({
    name, contents, containerRef, faceDown, enablePreview, drag, 
    onCardDragStart, onCardDragStop
}: ZoneProps) => {
    const isTargetZone = drag?.targetZone === name;
    const classes = 'zone' + (isTargetZone ? ' highlight' : '');

    const createCard = (zoneCard: ZoneCardInfo) => {
        const { card, x, y } = zoneCard;
        const transition = 'background-color 0.2s, box-shadow 0.5s' + (x && y ? '' : ', left 0.1s');
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
            ref={containerRef}
            id={name}
            className={classes}
            data-name={name.toUpperCase()}
        >
            {contents.map(createCard)}
        </div>
    );
}
