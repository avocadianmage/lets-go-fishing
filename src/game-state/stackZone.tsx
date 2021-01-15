import { useState } from "react";
import { CARD_WIDTH_PX, ZONE_PADDING_PX } from "../utilities/constants";
import { CardInfo } from "./card";
import { Zone, ZoneProps } from "./zone";

interface StackZoneProps extends ZoneProps {
    maxToShow?: number;
}

export const StackZone = (props: StackZoneProps) => {
    const { name, contents, drag, maxToShow } = props;
    const [width, setWidth] = useState(0);

    const getXForIndex = (cardCount: number, index: number) => {
        const handWidth = width - ZONE_PADDING_PX * 2;
        const offset = Math.min(
            CARD_WIDTH_PX,
            (handWidth - CARD_WIDTH_PX) / (cardCount - 1)
        );
        return offset * index + ZONE_PADDING_PX;
    };

    let nondraggedIndex = 0;
    const getCardX = (card: CardInfo, index: number) => {
        const isDragging = card.id === drag?.card.id;
        const positioningCardCount = contents.length - (
            (drag?.sourceZone !== name || isDragging) ? 0 : 1
        );
        const positioningIndex = isDragging ? index : nondraggedIndex++;
        const left = getXForIndex(positioningCardCount, positioningIndex);
        return left;
    };

    let updatedContents = maxToShow ? contents.slice(contents.length - maxToShow) : contents;
    updatedContents = updatedContents.map((zc, i) => {
        const { card } = zc;
        return { card, x: getCardX(card, i) };
    });

    return <Zone 
        {...props} 
        contents={updatedContents} 
        onSizeUpdated={setWidth} 
    />;
}
