import { CSSProperties, useEffect, useRef, useState } from "react";
import { CardInfo } from "../services/dbSvc";
import { CARD_WIDTH_PX, ZONE_PADDING_PX } from "../utilities/constants";
import { Card, CardClickEventHandler, CardDragStartEventHandler, CardDragStopEventHandler, DragInfo } from "./card";

export enum CardPosition {
    Manual,
    ShowTopFaceDown,
    HorizontallyStacked,
}

export interface CoreZoneProps {
    contents: CardInfo[];
    drag?: DragInfo;
    onCardDragStart: CardDragStartEventHandler;
    onCardDragStop: CardDragStopEventHandler;
    onCardClick?: CardClickEventHandler;
}

interface ZoneProps extends CoreZoneProps {
    name: string;
    cardPosition: CardPosition;
}

export const Zone = ({ 
    name, cardPosition, contents, drag, 
    onCardDragStart, onCardDragStop, onCardClick
}: ZoneProps) => {
    const [width, setWidth] = useState(0);

    const isSourceZone = drag?.sourceZone === name;
    const isTargetZone = drag?.targetZone === name;
    const classes = 'zone' + (isTargetZone ? ' darken' : '');

    const container = useRef<HTMLDivElement>(null);
    const updateWidth = () => setWidth(container.current!.clientWidth);
    useEffect(() => {
        if (cardPosition !== CardPosition.HorizontallyStacked) return;
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

    const isCardDragging = (card: CardInfo) => card.id === drag?.card.id;

    const createCard = (card: CardInfo, style?: CSSProperties) => <Card
        key={card.id}
        info={card}
        faceDown={cardPosition === CardPosition.ShowTopFaceDown}
        style={style}
        darken={isTargetZone && !isCardDragging(card)}
        onDragStart={drag => onCardDragStart({ 
            ...drag, sourceZone: name, targetZone: name
        })}
        onDragStop={onCardDragStop}
        onClick={onCardClick}
    />;

    let nondraggedIndex = 0;
    const getCardLeft = (card: CardInfo, index: number) => {
        const isDragging = isCardDragging(card);
        const positioningCardCount = contents.length - (
            (!isSourceZone || isDragging) ? 0 : 1
        );
        const positioningIndex = isDragging ? index : nondraggedIndex++;
        const left = getLeftForIndex(positioningCardCount, positioningIndex);
        return left;
    };
    return (
        <div id={name} className={classes} ref={container}>
            {cardPosition === CardPosition.ShowTopFaceDown ? 
                (contents.length > 0 && 
                    createCard(contents[contents.length - 1])
                ) :
                contents.map((card, index) => {
                    const style = 
                        cardPosition === CardPosition.HorizontallyStacked ? 
                            { left: getCardLeft(card, index) } : undefined;
                    return createCard(card, style);
                })
            }
        </div>
    );
}
