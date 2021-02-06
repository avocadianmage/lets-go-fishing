import { useEffect, useRef, useState } from 'react';
import { CardInfoService } from '../../services/cardInfoSvc';

import cardBack from '../../assets/mtg-card-back.png';
import Draggable, { ControlPosition } from 'react-draggable';
import { cancelablePromise } from '../../utilities/helpers';
import { ZoneCardInfo } from './zone';
import { CardInfo } from '../../services/dbSvc';
import { ZoneName } from './gameLayout';

export interface CardActionInfo {
    card: CardInfo;
    node: Element;
    sourceZone: ZoneName;
    targetZone?: ZoneName;
}

interface CardProps {
    zoneCard: ZoneCardInfo;
    faceDown?: boolean;
    enablePreview?: boolean;
    onDrag: CardActionEventHandler;
    onDragStop: CardActionEventHandler;
    onClick: CardActionEventHandler;
}

export type CardActionEventHandler = (drag: CardActionInfo) => boolean;

export const Card = (
    { zoneCard, faceDown, enablePreview, onDrag, onDragStop, onClick }: CardProps
) => {
    const { card, x, y, tapped, zIndex } = zoneCard;

    const [imageUrl, setImageUrl] = useState('');
    const [manualDragPos, setManualDragPos] = useState<ControlPosition>();

    const nodeRef = useRef<HTMLDivElement>(null);

    const isLoading = !imageUrl && !faceDown;

    useEffect(() => {
        const { promise, cancel } = cancelablePromise(CardInfoService.getCardImageUrl(card));
        promise.then(url => setImageUrl(url)).catch(() => { });
        return cancel;
    }, [card]);

    const getPositionTransform = () => {
        const round = (n?: number) => n ? Math.round(n) : 0;
        return { transform: `translate(${round(x)}px, ${round(y)}px)` };
    };

    const getCardStyles = () => ({
        backgroundImage: `url(${(isLoading || faceDown) ? cardBack : imageUrl})`,
        transform: tapped ? 'rotate(90deg)' : undefined,
    });

    const getClasses = () => {
        const faceUpAndLoaded = !isLoading && !faceDown;
        return 'card' +
            (isLoading ? ' loading' : '') +
            (faceUpAndLoaded && enablePreview ? ' enable-preview' : '') +
            (faceUpAndLoaded && card.foil ? ' foil' : '');
    };

    const createDrag = () => ({ 
        card, 
        node: nodeRef.current!.firstElementChild!, 
        sourceZone: ZoneName.None 
    });

    const fireDrag = () => {
        setManualDragPos(undefined);
        const success = onDrag(createDrag());
        if (!success) return false;
    };

    const fireDragStop = () => {
        if (!onDragStop(createDrag())) setManualDragPos({ x: 0, y: 0 });
        // Don't let react-draggable update since the card was dragged to a new zone.
        else return false;
    };

    const fireClick = () => onClick ? onClick(createDrag()) : true;

    return (
        <Draggable
            nodeRef={nodeRef}
            defaultClassName='card-drag-layer'
            onDrag={fireDrag}
            onStop={fireDragStop}
            position={manualDragPos}
        >
            <div ref={nodeRef} style={{ zIndex }} onClick={fireClick}>
                <div className='card-position-layer' style={getPositionTransform()}>
                    <div className={getClasses()} style={getCardStyles()}>
                        {isLoading ?
                            <div className='loader' /> :
                            <div className='card-face' />
                        }
                    </div>
                </div>
            </div>
        </Draggable>
    );
};
