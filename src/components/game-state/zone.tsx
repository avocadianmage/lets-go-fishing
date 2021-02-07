import { ForwardedRef, forwardRef, RefObject, useEffect, useState } from "react";
import { CardInfo } from "../../services/dbSvc";
import { Card, CardActionEventHandler, CardActionInfo } from "./card";
import { ZoneName } from "./gameLayout";

export interface ZoneCardInfo {
    card: CardInfo;
    x?: number;
    y?: number;
    tapped?: boolean;
    zIndex?: number;
}

export interface ZoneProps {
    name: ZoneName;
    contents: ZoneCardInfo[];
    classesToAppend?: string;
    faceDown?: boolean;
    enablePreview?: boolean;
    action?: CardActionInfo;
    onCardDrag: CardActionEventHandler;
    onCardDragStop: CardActionEventHandler;
}

export const useRect = (nodeRef: RefObject<HTMLElement>) => {
    const [rect, setRect] = useState<DOMRect>(new DOMRect());
    useEffect(() => {
        const updateRect = () => setRect(nodeRef.current!.getBoundingClientRect());
        window.addEventListener('resize', updateRect);
        updateRect();
        return () => window.removeEventListener('resize', updateRect);
    }, [nodeRef]);
    return rect;
};

export const Zone = forwardRef((
    {
        name, contents, classesToAppend, faceDown, enablePreview, action,
        onCardDrag, onCardDragStop
    }: ZoneProps,
    ref: ForwardedRef<HTMLDivElement>
) => {
    const isSourceZone = action?.sourceZone === name;
    const isTargetZone = action?.targetZone === name;
    const className = (
        'zone' + 
        (classesToAppend ? ' ' + classesToAppend : '') + 
        (isTargetZone ? ' highlight' : '')
    );

    const isCardDragging = (card: CardInfo) => card.id === action?.card.id;
    const updatedContents = contents.map(zc => ({
        ...zc, zIndex: isCardDragging(zc.card) ? Number.MAX_SAFE_INTEGER : zc.zIndex
    }));

    return (
        <div
            ref={ref}
            id={name}
            className={className}
            data-name={name.toUpperCase()}
            style={{ zIndex: isSourceZone ? 1 : 0 }}
        >
            {updatedContents.map(zc => (
                <Card
                    key={zc.card.id}
                    zoneCard={zc}
                    faceDown={faceDown}
                    enablePreview={enablePreview}
                    onDrag={info => onCardDrag({ ...info, sourceZone: name })}
                    onDragStop={info => onCardDragStop({ ...info, sourceZone: name })}
                />
            ))}
        </div>
    );
});
