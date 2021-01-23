import React, { useEffect, useState } from 'react';
import { CardInfoService } from '../services/cardInfoSvc';

import cardBack from '../assets/mtg-card-back.png';
import Draggable, { ControlPosition, DraggableData } from 'react-draggable';
import { cancelablePromise } from '../utilities/helpers';
import { CardInfo } from '../services/dbSvc';
import { ZoneCardInfo } from './zone';

export interface DragInfo {
    card: CardInfo;
    node: Element;
    sourceZone?: string;
    targetZone?: string;
}

interface CardProps {
    info: ZoneCardInfo;
    faceDown?: boolean;
    enablePreview?: boolean;
    onDragStart: CardDragStartEventHandler;
    onDragStop: CardDragStopEventHandler;
}

export type CardDragStartEventHandler = (drag: DragInfo) => boolean;
export type CardDragStopEventHandler = () => boolean;

export const Card = ({ info, faceDown, enablePreview, onDragStart, onDragStop }: CardProps) => {
    const { card, x, y } = info;

    const [imageUrl, setImageUrl] = useState('');
    const [manualDragPos, setManualDragPos] = useState<ControlPosition>();

    const isLoading = !imageUrl && !faceDown;

    useEffect(() => {
        const { promise, cancel } = cancelablePromise(CardInfoService.getCardImageUrl(card));
        promise.then(url => setImageUrl(url)).catch(() => {});
        return cancel;
    }, [card]);

    const getStyling = () => {
        const imageUrlToUse = (isLoading || faceDown) ? cardBack : imageUrl;
        const normalize = (n?: number) => n ? Math.round(n) : 0;
        return {
            backgroundImage: `url(${imageUrlToUse})`,
            transform: `translate(${normalize(x)}px, ${normalize(y)}px)`,
        };
    };

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
        // Don't let react-draggable update since the card was dragged to a new 
        // zone.
        else return false; 
    };

    const nodeRef = React.useRef(null);
    return (
        <Draggable
            nodeRef={nodeRef}
            onStart={fireDragStart}
            onStop={fireDragStop}
            position={manualDragPos}
        >
            <div ref={nodeRef}>
                <div className={getClasses()} style={getStyling()}>
                    {isLoading ?
                        <div className='loader' /> :
                        <div className='card-face' />
                    }
                </div>
            </div>
        </Draggable>
    );
};
