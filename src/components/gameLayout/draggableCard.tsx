import { CSSProperties, useRef, useState } from 'react';
import Draggable, { ControlPosition } from 'react-draggable';
import { VisualCard, VisualCardProps } from './visualCard';
import { ZoneCardInfo } from './zone';
import { Chip, SxProps } from '@mui/material';

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
    const chipSx: SxProps = {
        width: 'fit-content',
        height: 'fit-content',
        position: 'absolute',
        zIndex: 1,
        left: 0,
        right: 0,
        top: '25%',
        m: 'auto',
        color: 'black',
        bgcolor: 'rgba(255, 255, 255, 0.7)',
        fontSize: '2.5rem',
    };
    const counterLabel =
        (props.zoneCard.counters > 0 ? '+' : '') +
        (props.zoneCard.counters ? props.zoneCard.counters : '');

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
                    <Chip sx={chipSx} label={counterLabel} />
                    <VisualCard {...props} />
                </div>
            </div>
        </Draggable>
    );
};
