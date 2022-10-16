import clamp from 'lodash/clamp';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { CARD_HEIGHT_PX, CARD_WIDTH_PX, ZONE_BORDER_PX } from '../../utilities/constants';
import { useRect } from '../hooks/useRect';
import { Zone, ZoneProps } from './zone';

export const BattlefieldZone = forwardRef((props: ZoneProps, ref) => {
    const { contents } = props;

    const divRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => ({
        getBoundingClientRect: () => divRef.current!.getBoundingClientRect(),
    }));
    const { left, top, width, height } = useRect(divRef);

    const updatedContents = contents.map((zc) => {
        const snapToBounds = (horizontal: boolean) => {
            const [cardLen, cardPos, zoneLen, zoneMin] = horizontal
                ? [CARD_WIDTH_PX, zc.x!, width, left]
                : [CARD_HEIGHT_PX, zc.y!, height, top];
            const min = -ZONE_BORDER_PX;
            const max = zoneLen - cardLen - ZONE_BORDER_PX;
            return clamp(cardPos - zoneMin, min, max);
        };
        return { ...zc, x: snapToBounds(true), y: snapToBounds(false) };
    });

    return <Zone ref={divRef} {...props} contents={updatedContents} />;
});
