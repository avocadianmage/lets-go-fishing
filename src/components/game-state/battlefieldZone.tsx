import { forwardRef, useImperativeHandle, useRef } from "react";
import { CARD_HEIGHT_PX, CARD_WIDTH_PX } from "../../utilities/constants";
import { useRect, Zone, ZoneProps } from "./zone";

export const BattlefieldZone = forwardRef((props: ZoneProps, ref) => {
    const { contents } = props;

    const divRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => ({
        getBoundingClientRect: () => divRef.current!.getBoundingClientRect()
    }));
    const { left, top, width, height } = useRect(divRef);

    const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);
    const updatedContents = contents.map(zc => {
        const getTapMargin = (dim1: number, dim2: number) => zc.tapped ? (dim1 - dim2) / 2 : 0;
        const tapMarginX = getTapMargin(CARD_HEIGHT_PX, CARD_WIDTH_PX);
        const tapMarginY = getTapMargin(CARD_WIDTH_PX, CARD_HEIGHT_PX);
        return {
            ...zc,
            x: clamp(zc.x! - left, tapMarginX, width - CARD_WIDTH_PX - tapMarginX),
            y: clamp(zc.y! - top, tapMarginY, height - CARD_HEIGHT_PX - tapMarginY)
        };
    });

    return <Zone ref={divRef} {...props} contents={updatedContents} />;
});
