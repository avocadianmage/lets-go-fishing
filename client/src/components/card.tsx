import cardBack from '../assets/mtg-card-back.png';
import './css/card.css';

import { useEffect, useRef, useState } from 'react';
import { CardInfoService } from '../services/cardInfoSvc';
import Draggable, { ControlPosition } from 'react-draggable';
import { cancelablePromise } from '../utilities/helpers';
import { ZoneCardInfo } from './zone';
import { CardInfo } from '../services/dbSvc';
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
    onDrag: CardActionEventHandler;
    onDragStop: CardActionEventHandler;
    onMouseEnter: CardActionEventHandler;
    onMouseLeave: CardActionEventHandler;
}

export type CardActionEventHandler = (action: CardActionInfo) => boolean;

export const Card = ({ 
    zoneCard, faceDown, onDrag, onDragStop, onMouseEnter, onMouseLeave 
}: CardProps) => {
    const [imageUrl, setImageUrl] = useState('');
    const [manualDragPos, setManualDragPos] = useState<ControlPosition>();

    const nodeRef = useRef<HTMLDivElement>(null);

    const { card, x, y, tapped, zIndex, previewing } = zoneCard;
    const isLoading = !imageUrl && !faceDown;
    const faceUpAndLoaded = !isLoading && !faceDown;

    useEffect(() => {
        setImageUrl('');
        const { promise, cancel } = cancelablePromise(CardInfoService.getCardImageUrl(card));
        promise.then(url => setImageUrl(url)).catch(() => { });
        return cancel;
    }, [card]);

    const createAction = () => ({ 
        card, 
        node: nodeRef.current!.firstElementChild!, 
        sourceZone: ZoneName.None 
    });

    const fireDrag = () => {
        setManualDragPos(undefined);
        const success = onDrag(createAction());
        if (!success) return false;
    };

    const fireDragStop = () => {
        if (!onDragStop(createAction())) setManualDragPos({ x: 0, y: 0 });
        // Don't let react-draggable update since the card was dragged to a new zone.
        else return false;
    };

    const round = (n?: number) => n ? Math.round(n) : 0;
    const positionStyle = { transform: `translate(${round(x)}px, ${round(y)}px)` };
    const imageStyle = { 
        backgroundImage: `url(${(isLoading || faceDown) ? cardBack : imageUrl})` 
    };
    const className = (
        'card' +
        (isLoading ? ' loading' : '') +
        (faceUpAndLoaded && previewing ? ' previewing' : '') +
        (faceUpAndLoaded && card.foil ? ' foil' : '') +
        (tapped ? ' tapped' : '')
    );
    return (
        <Draggable
            nodeRef={nodeRef}
            defaultClassName='card-drag-layer'
            onDrag={fireDrag}
            onStop={fireDragStop}
            position={manualDragPos}
        >
            <div ref={nodeRef} style={{ zIndex }}>
                <div className='card-position-layer' style={positionStyle}>
                    <div 
                        className={className} 
                        style={imageStyle}
                        onMouseEnter={() => onMouseEnter(createAction())}
                        onMouseLeave={() => onMouseLeave(createAction())}
                    >
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
