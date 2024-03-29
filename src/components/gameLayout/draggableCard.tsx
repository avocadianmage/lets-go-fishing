import { CSSProperties, useRef, useState } from 'react';
import Draggable, { ControlPosition } from 'react-draggable';
import { VisualCard, VisualCardProps } from './visualCard';
import { ZoneCardInfo } from './zone';

interface DraggableCardProps extends VisualCardProps {
    zoneCard: ZoneCardInfo;
    onDrag: CardEventHandler;
    onDragStop: CardEventHandler;
    onMouseEnter: CardEventHandler;
    onMouseLeave: CardEventHandler;
    onClick: CardEventHandler;
    onDoubleClick: CardEventHandler;
}

export type CardEventHandler = (zoneCard: ZoneCardInfo) => boolean;

export const DraggableCard = (props: DraggableCardProps) => {
    const [manualDragPos, setManualDragPos] = useState<ControlPosition>();

    const { onDrag, onDragStop, onMouseEnter, onMouseLeave, onClick, onDoubleClick } = props;
    const nodeRef = useRef<HTMLDivElement>(null);
    const { x, y, zIndex } = props.zoneCard;

    const createUpdatedZoneCard = (): ZoneCardInfo => ({
        ...props.zoneCard,
        node: nodeRef.current!.firstElementChild!,
    });

    const fireDrag = () => {
        setManualDragPos({ x: 0, y: 0 });
        const success = onDrag(createUpdatedZoneCard());
        if (!success) return false;
    };

    const fireDragStop = () => {
        if (!onDragStop(createUpdatedZoneCard())) {
            setManualDragPos({ x: 0, y: 0 });
        }
        // Don't let react-draggable update since the card was dragged to a new zone.
        else return false;
    };

    const containerStyle: CSSProperties = { zIndex, writingMode: 'horizontal-tb' };
    const round = (n?: number) => (n ? Math.round(n) : 0);
    const positionStyle: CSSProperties = { transform: `translate(${round(x)}px, ${round(y)}px)` };

    return (
        <Draggable
            nodeRef={nodeRef}
            defaultClassName='card-drag-layer'
            onDrag={fireDrag}
            onStop={fireDragStop}
            position={manualDragPos}
        >
            <div ref={nodeRef} style={containerStyle}>
                <div
                    className='card-position-layer'
                    style={positionStyle}
                    onMouseEnter={() => onMouseEnter(createUpdatedZoneCard())}
                    onMouseLeave={() => onMouseLeave(createUpdatedZoneCard())}
                    onClick={() => onClick(createUpdatedZoneCard())}
                    onDoubleClick={() => onDoubleClick(createUpdatedZoneCard())}
                >
                    <VisualCard {...props} />
                </div>
            </div>
        </Draggable>
    );
};
