import { CardInfo } from "../services/dbSvc";
import { Card, CardDragStartEventHandler, CardDragStopEventHandler, DragInfo } from "./card";

export interface CoreZoneProps {
    contents: CardInfo[];
    drag?: DragInfo;
    onCardDragStart: CardDragStartEventHandler;
    onCardDragStop: CardDragStopEventHandler;
}

interface ZoneProps extends CoreZoneProps {
    name: string;
}

export const Zone = ({ 
    name, contents, drag, onCardDragStart, onCardDragStop 
}: ZoneProps) => {
    const isTargetZone = drag?.targetZone === name;

    const classes = 'zone' + (isTargetZone ? ' darken' : '');
    
    return (
        <div id={name} className={classes}>
            {contents.map(card => {
                const isDragging = card.id === drag?.card.id;
                return <Card
                    key={card.id}
                    info={card}
                    darken={isTargetZone && !isDragging}
                    onDragStart={drag => onCardDragStart({ 
                        ...drag, sourceZone: name, targetZone: name
                    })}
                    onDragStop={onCardDragStop}
                />;
            })}
        </div>
    );
}
