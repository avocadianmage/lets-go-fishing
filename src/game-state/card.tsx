import React, { CSSProperties, useEffect, useState } from 'react';
import { CardInfoService } from '../services/cardInfoSvc';

import cardBack from '../assets/mtg-card-back.png';
import Draggable, { ControlPosition, DraggableData } from 'react-draggable';
import { cancelablePromise } from '../utilities/helpers';

export interface CardProps {
    info: CardInfo;
    faceDown?: boolean;
    enablePreview?: boolean;
    darken?: boolean;
    onDragStart: CardDragStartEventHandler;
    onDragStop: CardDragStopEventHandler;
}

export interface CardInfo {
    id: number;
    name: string;
    set: string;
    foil: boolean;
    style?: CSSProperties;
}

export interface DragInfo {
    card: CardInfo;
    node: HTMLElement;
    sourceZone?: string;
    targetZone?: string;
}

export type CardDragStartEventHandler = (drag: DragInfo) => boolean;
export type CardDragStopEventHandler = () => boolean;

export const Card = ({
    info, faceDown, enablePreview, darken, onDragStart, onDragStop
}: CardProps) => {
    const [imageUrl, setImageUrl] = useState('');
    const [manualDragPos, setManualDragPos] = useState<ControlPosition>();

    const isLoading = !imageUrl && !faceDown;

    useEffect(() => {
        const { promise, cancel } = cancelablePromise(
            CardInfoService.getCardImageBlob(info.name, info.set)
        );
        promise
            .then(blob => setImageUrl(URL.createObjectURL(blob)))
            .catch(() => {});
        return cancel;
    }, [info.name, info.set]);

    const getStyling = () => {
        const imageUrlToUse = (isLoading || faceDown) ? cardBack : imageUrl;
        return Object.assign(
            { backgroundImage: `url(${imageUrlToUse})` },
            info.style,
        );
    };

    const getClasses = () => {
        const faceUpAndLoaded = !isLoading && !faceDown;
        return 'card' +
            (isLoading ? ' loading' : '') +
            (faceUpAndLoaded && enablePreview ? ' enable-preview' : '') +
            (faceUpAndLoaded && info.foil ? ' foil' : '') +
            (darken ? ' darken' : '');
    };

    const fireDragStart = (_: any, data: DraggableData) => {
        setManualDragPos(undefined);
        if (!onDragStart({ card: info, node: data.node })) return false;
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
            >
                {isLoading ?
                    <div className='loader' /> :
                    <div className='card-face' />
                }
            </div>
        </Draggable>
    );
};
