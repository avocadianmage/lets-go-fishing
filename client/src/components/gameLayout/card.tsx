import cardBack from '../../assets/mtg-card-back.png';
import '../css/card.css';

import { useEffect, useRef, useState } from 'react';
import { CardInfoService } from '../../services/cardInfoSvc';
import Draggable, { ControlPosition } from 'react-draggable';
import { cancelablePromise } from '../../utilities/helpers';
import { ZoneCardInfo } from './zone';
import { CardInfo } from '../../services/dbSvc';
import { ZoneName } from './gameLayout';
import { CARD_HEIGHT_PX, CARD_WIDTH_PX } from '../../utilities/constants';

export interface CardActionInfo {
    card: CardInfo;
    node: Element;
    sourceZone: ZoneName;
    targetZone?: ZoneName;
}

interface CardProps {
    zoneCard: ZoneCardInfo;
    faceDown?: boolean;
    wiggle?: boolean;
    disabled?: boolean;
    onDrag?: CardActionEventHandler;
    onDragStop?: CardActionEventHandler;
    onMouseEnter?: CardActionEventHandler;
    onMouseLeave?: CardActionEventHandler;
    onDoubleClick?: CardActionEventHandler;
}

export type CardActionEventHandler = (action: CardActionInfo) => boolean;

export const Card = ({
    zoneCard,
    faceDown,
    wiggle,
    disabled,
    onDrag,
    onDragStop,
    onMouseEnter,
    onMouseLeave,
    onDoubleClick,
}: CardProps) => {
    const [imageUrl, setImageUrl] = useState('');
    const [manualDragPos, setManualDragPos] = useState<ControlPosition>();

    const nodeRef = useRef<HTMLDivElement>(null);

    const { card, x, y, zIndex, previewing, tapped } = zoneCard;
    const isLoading = !imageUrl && !faceDown;
    const faceUpAndLoaded = !isLoading && !faceDown;

    useEffect(() => {
        setImageUrl('');
        const { promise, cancel } = cancelablePromise(CardInfoService.getCardImageUrl(card));
        promise.then((url) => setImageUrl(url)).catch(() => {});
        return cancel;
    }, [card]);

    const createAction = (): CardActionInfo => ({
        card,
        node: nodeRef.current!.firstElementChild!,
        sourceZone: ZoneName.None,
    });

    const fireDrag = () => {
        if (!onDrag) return false;

        setManualDragPos({ x: 0, y: 0 });
        const success = onDrag(createAction());
        if (!success) return false;
    };

    const fireDragStop = () => {
        if (!onDragStop) return false;

        if (!onDragStop(createAction())) {
            setManualDragPos({ x: 0, y: 0 });
        }
        // Don't let react-draggable update since the card was dragged to a new zone.
        else return false;
    };

    const round = (n?: number) => (n ? Math.round(n) : 0);
    const positionStyle = { transform: `translate(${round(x)}px, ${round(y)}px)` };
    const imageStyle = {
        backgroundImage: `url(${isLoading || faceDown ? cardBack : imageUrl})`,
    };
    const className =
        'card' +
        (isLoading ? ' loading' : '') +
        (faceUpAndLoaded && previewing ? ' previewing' : '') +
        (faceUpAndLoaded && card.foil ? ' foil' : '') +
        (tapped ? ' tapped' : '') +
        (wiggle ? ' wiggle' : '');

    const VisualLayerCard = () => (
        <div
            className={className}
            style={imageStyle}
            onMouseEnter={() => onMouseEnter && onMouseEnter(createAction())}
            onMouseLeave={() => onMouseLeave && onMouseLeave(createAction())}
            onDoubleClick={() => onDoubleClick && onDoubleClick(createAction())}
        >
            {/* Separate divs needed to prevent React from replacing one with the other 
                            during CSS animations. */}
            <div className='loader' style={isLoading ? {} : { display: 'none' }} />
            <div className='card-face' style={isLoading ? { display: 'none' } : {}} />
        </div>
    );

    const DraggableCard = () => (
        <Draggable
            nodeRef={nodeRef}
            defaultClassName='card-drag-layer'
            onDrag={fireDrag}
            onStop={fireDragStop}
            position={manualDragPos}
        >
            <div ref={nodeRef} style={{ zIndex }}>
                <div className='card-position-layer' style={positionStyle}>
                    <VisualLayerCard />
                </div>
            </div>
        </Draggable>
    );

    const DisabledCard = () => (
        <div style={{ width: CARD_WIDTH_PX, height: CARD_HEIGHT_PX }}>
            <div
                style={{
                    width: CARD_WIDTH_PX,
                    height: CARD_HEIGHT_PX,
                    position: 'absolute',
                }}
            >
                <VisualLayerCard />
            </div>
        </div>
    );

    return disabled ? <DisabledCard /> : <DraggableCard />;
};
