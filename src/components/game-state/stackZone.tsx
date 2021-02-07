import { forwardRef, useImperativeHandle, useRef } from "react";
import { CardInfo } from "../../services/dbSvc";
import { CARD_HEIGHT_PX, CARD_WIDTH_PX, ZONE_PADDING_PX } from "../../utilities/constants";
import { useRect, Zone, ZoneProps } from "./zone";

interface StackZoneProps extends ZoneProps {
    maxToShow?: number;
    verticalOrientation?: boolean;
}

export const StackZone = forwardRef((props: StackZoneProps, ref) => {
    const { name, contents, action, maxToShow, verticalOrientation } = props;

    const divRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => ({
        getBoundingClientRect: () => divRef.current!.getBoundingClientRect()
    }));
    const { width, height } = useRect(divRef);

    const lengths = verticalOrientation ? 
            { length: height, cardLength: CARD_HEIGHT_PX } :
            { length: width, cardLength: CARD_WIDTH_PX };
    const { length, cardLength } = lengths;
    const lengthSansPadding = length - ZONE_PADDING_PX * 2;

    const getOffsetForIndex = (cardCount: number, index: number) => {
        const offset = Math.min(
            cardLength,
            (lengthSansPadding - cardLength) / (cardCount - 1)
        );
        return offset * index + ZONE_PADDING_PX;
    };

    const isCardDragging = (card: CardInfo) => card.id === action?.card.id;

    let nondraggedIndex = 0;
    const getCardOffset = (card: CardInfo, index: number) => {
        const isDragging = isCardDragging(card);
        const positioningCardCount = contents.length - (
            (action?.sourceZone !== name || isDragging) ? 0 : 1
        );
        const positioningIndex = isDragging ? index : nondraggedIndex++;
        const offset = getOffsetForIndex(positioningCardCount, positioningIndex);
        return verticalOrientation ? 
            { x: ZONE_PADDING_PX, y: offset } : 
            { x: offset, y: ZONE_PADDING_PX };
    };

    let updatedContents = maxToShow ? contents.slice(contents.length - maxToShow) : contents;
    updatedContents = updatedContents.map((zc, i) => { 
        const { x, y } = getCardOffset(zc.card, i);
        return { ...zc, x, y };
    });

    return <Zone ref={divRef} {...props} contents={updatedContents} extraClassName="stack-zone" />;
});
