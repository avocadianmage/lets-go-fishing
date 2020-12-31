import { useEffect, useRef, useState } from "react";
import { CardInfo } from "../services/dbSvc";
import { CARD_WIDTH_PX, ZONE_PADDING_PX } from "../utilities/constants";
import { Card, CardDragStartEventHandler, CardDragStopEventHandler, DragInfo } from "./card";

export enum CardPosition {
    Manual,
    HorizontallyStacked,
}

export interface CoreZoneProps {
    contents: CardInfo[];
    drag?: DragInfo;
    onCardDragStart: CardDragStartEventHandler;
    onCardDragStop: CardDragStopEventHandler;
}

interface ZoneProps extends CoreZoneProps {
    name: string;
    cardPosition: CardPosition;
}

export const Zone = ({ 
    name, cardPosition, contents, drag, onCardDragStart, onCardDragStop 
}: ZoneProps) => {
    const [width, setWidth] = useState(0);

    const isSourceZone = drag?.sourceZone === name;
    const isTargetZone = drag?.targetZone === name;
    const classes = 'zone' + (isTargetZone ? ' darken' : '');

    const container = useRef<HTMLDivElement>(null);
    const updateWidth = () => setWidth(container.current!.clientWidth);
    useEffect(() => {
        if (cardPosition === CardPosition.Manual) return;
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    });

    const getLeftForIndex = (cardCount: number, index: number) => {
        const handWidth = width - ZONE_PADDING_PX * 2;
        const offset = Math.min(
            CARD_WIDTH_PX,
            (handWidth - CARD_WIDTH_PX) / (cardCount - 1)
        );
        return (offset * index + ZONE_PADDING_PX) + 'px';
    };

    let nondraggedIndex = 0;
    const getCardProps = (
        card: CardInfo, index: number
    ) => {
        const isDragging = card.id === drag?.card.id;
        const positioningCardCount = contents.length - (
            (!isSourceZone || isDragging) ? 0 : 1
        );
        const positioningIndex = isDragging ? index : nondraggedIndex++;
        const left = getLeftForIndex(positioningCardCount, positioningIndex);
        return { isDragging, left };
    };
    return (
        <div id={name} className={classes} ref={container}>
            {contents.map((card, index) => {
                const { isDragging, left } = getCardProps(
                    card, index
                );
                const style = 
                    cardPosition === CardPosition.HorizontallyStacked ? 
                        { left } : undefined;
                return <Card
                    key={card.id}
                    info={card}
                    style={style}
                    darken={isTargetZone && !isDragging}
                    onDragStart={drag => onCardDragStart({ 
                        ...drag, sourceZone: name, targetZone: name
                    })}
                    onDragStop={onCardDragStop}
                />;
            })}
        </div>
    );
}
