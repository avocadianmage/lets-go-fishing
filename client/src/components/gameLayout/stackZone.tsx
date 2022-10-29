import { forwardRef, useImperativeHandle, useRef } from "react";
import { CardInfo } from "../../services/dbSvc";
import { CARD_HEIGHT_PX, CARD_WIDTH_PX, ZONE_BORDER_PX, ZONE_PADDING_PX } from "../../utilities/constants";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useRect } from "../hooks/useRect";
import { CardActionInfo } from "./card";
import { Zone, ZoneProps } from "./zone";

interface StackZoneProps extends ZoneProps {
    showTopOnly?: boolean;
    vertical?: boolean;
}

export const StackZone = forwardRef((props: StackZoneProps, ref) => {
    const { contents, showTopOnly, vertical, onCardMouseEnter } = props;

    const [previewingCard, setPreviewingCard] = useDebouncedValue<CardInfo>(undefined, 100);

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
        const centeringOffset = Math.max(0, lengthSansPadding - cardLength * cardCount) / 2;
        return [offset * index + ZONE_PADDING_PX + centeringOffset, ZONE_PADDING_PX];
    };

    const getCardOffset = (index: number) => {
        const [offsetDim, constantDim] = getOffsetsForIndex(contents.length, index);
        return vertical ? { x: constantDim, y: offsetDim } : { x: offsetDim, y: constantDim };
    };

    const className = (
        'stack-zone' +
        (showTopOnly ? ' show-top-only' : '') +
        (vertical ? ' vertical' : '')
    );

    // When only showing the top card, still need to load two in case the user drags the top card.
    const updatedContents = contents.slice(showTopOnly ? contents.length - 2 : 0).map((zc, i) => {
        const { card } = zc;
        const { x, y } = getCardOffset(i);
        const previewing = card.id === previewingCard?.id;
        return { ...zc, x, y, previewing };
    });

    const fireCardMouseEnter = (action: CardActionInfo) => {
        if (!showTopOnly) setPreviewingCard(action.card);
        return onCardMouseEnter ? onCardMouseEnter(action) : true;
    };

    return <Zone
        ref={divRef}
        {...props}
        contents={updatedContents}
        classesToAppend={className}
        onCardMouseEnter={fireCardMouseEnter}
    />;
});
