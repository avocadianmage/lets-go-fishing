import { forwardRef, useImperativeHandle, useRef } from "react";
import { CardInfo } from "../../services/dbSvc";
import { CARD_WIDTH_PX, ZONE_PADDING_PX } from "../../utilities/constants";
import { useRect, Zone, ZoneProps } from "./zone";

interface StackZoneProps extends ZoneProps {
    maxToShow?: number;
}

export const StackZone = forwardRef((props: StackZoneProps, ref) => {
    const { name, contents, action, maxToShow } = props;

    const divRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => ({
        getBoundingClientRect: () => divRef.current!.getBoundingClientRect()
    }));
    const { width } = useRect(divRef);

    const getXForIndex = (cardCount: number, index: number) => {
        const handWidth = width - ZONE_PADDING_PX * 2;
        const offset = Math.min(
            CARD_WIDTH_PX,
            (handWidth - CARD_WIDTH_PX) / (cardCount - 1)
        );
        return offset * index + ZONE_PADDING_PX;
    };

    const isCardDragging = (card: CardInfo) => card.id === action?.card.id;

    let nondraggedIndex = 0;
    const getCardX = (card: CardInfo, index: number) => {
        const isDragging = isCardDragging(card);
        const positioningCardCount = contents.length - (
            (action?.sourceZone !== name || isDragging) ? 0 : 1
        );
        const positioningIndex = isDragging ? index : nondraggedIndex++;
        const left = getXForIndex(positioningCardCount, positioningIndex);
        return left;
    };

    let updatedContents = maxToShow ? contents.slice(contents.length - maxToShow) : contents;
    updatedContents = updatedContents.map((zc, i) => ({ 
        ...zc, 
        x: getCardX(zc.card, i), 
        y: ZONE_PADDING_PX, 
    }));

    return <Zone ref={divRef} {...props} contents={updatedContents} />;
});
