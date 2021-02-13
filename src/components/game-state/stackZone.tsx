import { forwardRef, useImperativeHandle, useRef } from "react";
import { CardInfo } from "../../services/dbSvc";
import { CARD_HEIGHT_PX, CARD_WIDTH_PX, ZONE_BORDER_PX, ZONE_PADDING_PX } from "../../utilities/constants";
import { useRect, Zone, ZoneProps } from "./zone";

interface StackZoneProps extends ZoneProps {
    showTopOnly?: boolean;
    vertical?: boolean;
}

export const StackZone = forwardRef((props: StackZoneProps, ref) => {
    const { name, contents, action, showTopOnly, vertical } = props;

    const divRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => ({
        getBoundingClientRect: () => divRef.current!.getBoundingClientRect()
    }));
    const { width, height } = useRect(divRef);

    const lengths = vertical ? 
            { length: height, cardLength: CARD_HEIGHT_PX } :
            { length: width, cardLength: CARD_WIDTH_PX };
    const { length, cardLength } = lengths;
    const lengthSansPadding = length - ZONE_PADDING_PX * 2 - ZONE_BORDER_PX * 2;

    const getOffsetsForIndex = (cardCount: number, index: number) => {
        const offset = cardCount === 1 ? 
            0 : Math.min(cardLength, (lengthSansPadding - cardLength) / (cardCount - 1));
        return [offset * index + ZONE_PADDING_PX, ZONE_PADDING_PX];
    };

    const isCardDragging = (card: CardInfo) => card.id === action?.card.id;

    let nondraggedIndex = 0;
    const getCardOffset = (card: CardInfo, index: number) => {
        const isDragging = isCardDragging(card);
        const positioningCardCount = contents.length - (
            (action?.sourceZone !== name || isDragging) ? 0 : 1
        );
        const positioningIndex = isDragging ? index : nondraggedIndex++;
        const [offsetDim, constantDim] = getOffsetsForIndex(positioningCardCount, positioningIndex);
        return vertical ? { x: constantDim, y: offsetDim } : { x: offsetDim, y: constantDim };
    };
    
    const className = (
        'stack-zone' + 
        (showTopOnly ? ' show-top-only' : '') +
        (vertical ? ' vertical' : '')
    );

    // When only showing the top card, still need to load two in case the user drags the top card.
    let updatedContents = showTopOnly ? contents.slice(contents.length - 2) : contents;
    updatedContents = updatedContents.map((zc, i) => { 
        const { x, y } = getCardOffset(zc.card, i);
        return { ...zc, x, y };
    });

    return <Zone ref={divRef} {...props} contents={updatedContents} classesToAppend={className} />;
});
