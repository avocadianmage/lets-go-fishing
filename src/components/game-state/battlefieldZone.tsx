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
    const updatedContents = contents.map(zc => ({
        ...zc,
        x: clamp(zc.x! - left, 0, width - CARD_WIDTH_PX),
        y: clamp(zc.y! - top, 0, height - CARD_HEIGHT_PX)
    }));

    return <Zone ref={divRef} {...props} contents={updatedContents} />;
});
