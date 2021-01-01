import React, { CSSProperties, useEffect, useState } from 'react';
import { CardInfoService } from '../services/cardInfoSvc';

import cardBack from '../assets/mtg-card-back.png';
import { CardInfo } from '../services/dbSvc';
import Draggable, { ControlPosition } from 'react-draggable';

export interface CardProps {
    info: CardInfo;
    darken: boolean;
    faceDown?: boolean;
    style?: CSSProperties;
    onDragStart: CardDragStartEventHandler;
    onDragStop: CardDragStopEventHandler;
    onClick?(): void;
}

export interface DragInfo {
    card: CardInfo;
    sourceZone?: string;
    targetZone?: string;
}

export type CardDragStartEventHandler = (drag: DragInfo) => boolean;
export type CardDragStopEventHandler = () => boolean;

export const Card = ({
    info, faceDown, style, darken, onDragStart, onDragStop, onClick
}: CardProps) => {
    const [imageUrl, setImageUrl] = useState('');
    const [manualDragPos, setManualDragPos] = useState<ControlPosition>();

    const isLoading = !imageUrl && !faceDown;

    useEffect(() => {
        CardInfoService.getCardImageBlob(info)
            .then(blob => setImageUrl(URL.createObjectURL(blob)));
    }, [info]);

    const getStyling = () => {
        const imageUrlToUse = (isLoading || faceDown) ? cardBack : imageUrl;
        return Object.assign(
            { backgroundImage: `url(${imageUrlToUse})` },
            style,
        );
    };

    const getClasses = () => {
        return 'card' +
            (isLoading ? ' loading' : '') +
            (!isLoading && !faceDown && info.foil ? ' foil' : '') +
            (darken ? ' darken' : '');
    };

    const fireDragStart = () => {
        setManualDragPos(undefined);
        if (!onDragStart({ card: info })) return false;
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
            <div
                ref={nodeRef}
                className={getClasses()}
                style={getStyling()}
                onClick={onClick}
            >
                {isLoading ?
                    <div className='loader' /> :
                    (!faceDown && 
                        <div className='card-face' />
                    )
                }
            </div>
        </Draggable>
    );
};
