import { useState } from "react";
import { CardInfo } from "../services/dbSvc";
import { CARD_WIDTH_PX, ZONE_PADDING_PX } from "../utilities/constants";
import { Zone, ZoneProps } from "./zone";

export const WithStack = (WrappedZone: typeof Zone, showTopOnly?: boolean) => {
    return (props: ZoneProps) => {
        const { name, contents, drag, onSizeChanged } = props;
        const [width, setWidth] = useState(0);

        const fireSizeChanged = (width: number) => {
            if (onSizeChanged) onSizeChanged(width);
            setWidth(width);
        }

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

        // If specified to only show the top card, also render the card directly beneath so it shows 
        // up if the top card gets dragged.
        let updatedContents = showTopOnly ? contents.slice(contents.length - 2) : contents;
        updatedContents = updatedContents.map((zc, i) => {
            const { card } = zc;
            return { card, x: getCardX(card, i) };
        });

        return <WrappedZone
            {...props}
            contents={updatedContents}
            onSizeChanged={fireSizeChanged}
        />;
    }
}
