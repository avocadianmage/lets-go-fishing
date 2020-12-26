import React, { CSSProperties, MouseEventHandler, useEffect, useState } from 'react';
import { CardInfoService } from '../services/cardInfoSvc';

import cardBack from '../assets/mtg-card-back.png';
import { CardInfo } from '../services/dbSvc';
import Draggable, { ControlPosition, DraggableData, DraggableEvent } from 'react-draggable';

export interface CardProps {
    info?: CardInfo;
    faceDown?: boolean;
    style?: CSSProperties;
    onClick?: MouseEventHandler<HTMLDivElement>;
    onDragStart: CardDragEventHandler;
    onDragStop: CardDragEventHandler;
}

export type CardDragEventHandler = (
    cardInfo: CardInfo,
    cardElem: HTMLElement,
) => boolean;

export const Card = ({
    info, faceDown, style, onClick, onDragStart, onDragStop
}: CardProps) => {
    const [imageUrl, setImageUrl] = useState('');
    const [manualDragPos, setManualDragPos] = useState<ControlPosition>();

    const isLoading = !info || (!imageUrl && !faceDown);

    // Perform card image lookup when info is set.
    useEffect(() => {
        if (!info) return;
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
        return "card " +
            (isLoading ? "loading " : "") +
            (!isLoading && !faceDown && info?.foil ? "foil " : "");
    };

    const fireDragStart = (_: DraggableEvent, data: DraggableData) => {
        setManualDragPos(undefined);
        if (!info || !onDragStart(info, data.node)) return false;
    };

    const fireDragStop = (_: DraggableEvent, data: DraggableData) => {
        if (info && !onDragStop(info, data.node)) {
            setManualDragPos({ x: 0, y: 0 });
        }
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
                    <div className="loader" /> :
                    (!faceDown && <div className={"card-face"} />)
                }
            </div>
        </Draggable>
    );
};
