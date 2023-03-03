import '../css/card.css';

import { useRef, useState } from 'react';
import Draggable, { ControlPosition } from 'react-draggable';
import { CardInfo } from '../../services/dbSvc';
import { ZoneName } from './gameLayout';
import { VisualCard, VisualCardProps } from './visualCard';
import { ZoneCardInfo } from './zone';

export interface CardActionInfo {
    card: CardInfo;
    node: Element;
    sourceZone: ZoneName;
    targetZone?: ZoneName;
}

interface DraggableCardProps extends VisualCardProps {
    zoneCard: ZoneCardInfo;
    onDrag: CardActionEventHandler;
    onDragStop: CardActionEventHandler;
    onMouseEnter: CardActionEventHandler;
    onMouseLeave: CardActionEventHandler;
    onDoubleClick: CardActionEventHandler;
}

export type CardActionEventHandler = (action: CardActionInfo) => boolean;

export const DraggableCard = (props: DraggableCardProps) => {
    const [manualDragPos, setManualDragPos] = useState<ControlPosition>();

    const nodeRef = useRef<HTMLDivElement>(null);

    const { zoneCard, onDrag, onDragStop, onMouseEnter, onMouseLeave, onDoubleClick } = props;
    const { card, x, y, zIndex } = zoneCard;

    const createAction = (): CardActionInfo => ({
        card,
        node: nodeRef.current!.firstElementChild!,
        sourceZone: ZoneName.None,
    });

    const fireDrag = () => {
        setManualDragPos({ x: 0, y: 0 });
        const success = onDrag(createAction());
        if (!success) return false;
    };

    const fireDragStop = () => {
        if (!onDragStop(createAction())) {
            setManualDragPos({ x: 0, y: 0 });
        }
        // Don't let react-draggable update since the card was dragged to a new zone.
        else return false;
    };

    const round = (n?: number) => (n ? Math.round(n) : 0);
    const positionStyle = { transform: `translate(${round(x)}px, ${round(y)}px)` };

    return (
        <Draggable
            nodeRef={nodeRef}
            defaultClassName='card-drag-layer'
            onDrag={fireDrag}
            onStop={fireDragStop}
            position={manualDragPos}
        >
            <div ref={nodeRef} style={{ zIndex }}>
                <div
                    className='card-position-layer'
                    style={positionStyle}
                    onMouseEnter={() => onMouseEnter(createAction())}
                    onMouseLeave={() => onMouseLeave(createAction())}
                    onDoubleClick={() => onDoubleClick(createAction())}
                >
                    {/* determine if the above needs to move into visual card */}
                    <VisualCard {...props} />
                </div>
            </div>
        </Draggable>
    );
};
