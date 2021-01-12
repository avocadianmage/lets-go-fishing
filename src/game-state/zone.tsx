import { CSSProperties, useEffect, useRef, useState } from "react";
import { CardInfo } from "../services/dbSvc";
import { CARD_WIDTH_PX, ZONE_PADDING_PX } from "../utilities/constants";
import { Card, CardDragStartEventHandler, CardDragStopEventHandler, DragInfo } from "./card";

export enum Arrangement {
    HorizontalOverlap,
    Manual,
}

export interface CoreZoneProps {
    contents: CardInfo[];
    drag?: DragInfo;
    onCardDragStart: CardDragStartEventHandler;
    onCardDragStop: CardDragStopEventHandler;
}

interface ZoneProps extends CoreZoneProps {
    name: string;
    arrangement: Arrangement;
    faceDown?: boolean;
    maxToShow?: number;
}

export const Zone = ({
    name, arrangement, faceDown, maxToShow,
    contents, drag, onCardDragStart, onCardDragStop
}: ZoneProps) => {
    const [width, setWidth] = useState(0);

    const isSourceZone = drag?.sourceZone === name;
    const isTargetZone = drag?.targetZone === name;

    const container = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (arrangement !== Arrangement.HorizontalOverlap) return;
        const updateWidth = () => setWidth(container.current!.clientWidth);
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    });

    const getClasses = () => 'zone' + (isTargetZone ? ' darken' : '');

    const isCardDragging = (card: CardInfo) => card.id === drag?.card.id;

    const getLeftForIndex = (cardCount: number, index: number) => {
        const handWidth = width - ZONE_PADDING_PX * 2;
        const offset = Math.min(
            CARD_WIDTH_PX,
            (handWidth - CARD_WIDTH_PX) / (cardCount - 1)
        );
        return (offset * index + ZONE_PADDING_PX) + 'px';
    };

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

    const createCard = (card: CardInfo, style?: CSSProperties) => <Card
        key={card.id}
        info={card}
        faceDown={faceDown}
        enablePreview={arrangement === Arrangement.HorizontalOverlap}
        style={style}
        darken={isTargetZone && !isCardDragging(card)}
        onDragStart={drag => onCardDragStart({ ...drag, sourceZone: name })}
        onDragStop={onCardDragStop}
    />;

    const createArrangement = () => {
        const cardsToShow = maxToShow ? 
            contents.slice(contents.length - maxToShow) : contents;

        switch (arrangement) {
            case Arrangement.Manual:
                return cardsToShow.map(card => createCard(card));

            case Arrangement.HorizontalOverlap:
                return cardsToShow.map((card, index) => (
                    createCard(card, { 
                        left: getCardLeft(card, index),
                        position: 'absolute',
                    })
                ));
        }
    }

    return (
        <div
            id={name}
            className={getClasses()}
            ref={container}
            data-name={name.toUpperCase()}
        >
            {createArrangement()}
        </div>
    );
}
