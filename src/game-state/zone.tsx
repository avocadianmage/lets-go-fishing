import { useEffect, useRef } from "react";
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
    onSizeChanged?(width: number): void;
}

export const Zone = ({
    name, contents, faceDown, enablePreview, drag, 
    onCardDragStart, onCardDragStop, onSizeChanged
}: ZoneProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!onSizeChanged) return;
        const updateWidth = () => onSizeChanged(containerRef.current!.clientWidth);
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    });

    const isTargetZone = drag?.targetZone === name;
    const classes = 'zone' + (isTargetZone ? ' darken' : '');

    const isCardDragging = (card: CardInfo) => card.id === drag?.card.id;

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
            darken={isTargetZone && !isCardDragging(card)}
            onDragStart={drag => onCardDragStart({ ...drag, sourceZone: name })}
            onDragStop={onCardDragStop}
        />;
    }

    return (
        <div
            id={name}
            className={classes}
            ref={containerRef}
            data-name={name.toUpperCase()}
        >
            {contents.map(createCard)}
        </div>
    );
}
