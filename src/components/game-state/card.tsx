import React, { useEffect, useState } from 'react';
import { CardInfoService } from '../../services/cardInfoSvc';

import cardBack from '../../assets/mtg-card-back.png';
import Draggable, { ControlPosition, DraggableData } from 'react-draggable';
import { cancelablePromise } from '../../utilities/helpers';
import { ZoneCardInfo } from './zone';
import { CardInfo } from '../../services/dbSvc';

export interface DragInfo {
    card: CardInfo;
    node: Element;
    sourceZone?: string;
    targetZone?: string;
}

interface CardProps {
    zoneCard: ZoneCardInfo;
    faceDown?: boolean;
    enablePreview?: boolean;
    onDragStart: CardDragStartEventHandler;
    onDragStop: CardDragStopEventHandler;
}

export type CardDragStartEventHandler = (drag: DragInfo) => boolean;
export type CardDragStopEventHandler = () => boolean;

export const Card = ({ zoneCard, faceDown, enablePreview, onDragStart, onDragStop }: CardProps) => {
    const { card, x, y, tapped, zIndex } = zoneCard;

    const [imageUrl, setImageUrl] = useState('');
    const [manualDragPos, setManualDragPos] = useState<ControlPosition>();

    const isLoading = !imageUrl && !faceDown;

    useEffect(() => {
        const { promise, cancel } = cancelablePromise(CardInfoService.getCardImageUrl(card));
        promise.then(url => setImageUrl(url)).catch(() => { });
        return cancel;
    }, [card]);

    const getStyles = () => {
        const imageUrlToUse = (isLoading || faceDown) ? cardBack : imageUrl;
        return { 
            backgroundImage: `url(${imageUrlToUse})`,
            transform: tapped ? 'rotate(90deg)' : undefined,
        };
    };

    const getPositionTransform = () => {
        const round = (n?: number) => n ? Math.round(n) : 0;
        return { transform: `translate(${round(x)}px, ${round(y)}px)` };
    }

    const getClasses = () => {
        const faceUpAndLoaded = !isLoading && !faceDown;
        return 'card' +
            (isLoading ? ' loading' : '') +
            (faceUpAndLoaded && enablePreview ? ' enable-preview' : '') +
            (faceUpAndLoaded && card.foil ? ' foil' : '');
    };

    const fireDragStart = (_: any, data: DraggableData) => {
        setManualDragPos(undefined);
        const success = onDragStart({ card, node: data.node.firstElementChild! });
        if (!success) return false;
    };

    const fireDragStop = () => {
        if (!onDragStop()) setManualDragPos({ x: 0, y: 0 });
        // Don't let react-draggable update since the card was dragged to a new zone.
        else return false;
    };

    const nodeRef = React.useRef(null);
    return (
        <Draggable
            nodeRef={nodeRef}
            defaultClassName='card-drag-layer'
            onStart={fireDragStart}
            onStop={fireDragStop}
            position={manualDragPos}
        >
            <div ref={nodeRef} style={{ zIndex }}>
                <div className='card-position-layer' style={getPositionTransform()}>
                    <div className={getClasses()} style={getStyles()}>
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
