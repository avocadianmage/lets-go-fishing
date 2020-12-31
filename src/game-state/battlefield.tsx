import { CardInfo } from "../services/dbSvc";
import { Card, DragInfo } from "./card";
import { Zone } from "./gameLayout";

interface BattlefieldProps {
    contents: CardInfo[];
    drag?: DragInfo;
}

export const Battlefield = ({ contents, drag }: BattlefieldProps) => {
    const isTargetZone = drag?.targetZone === Zone.Battlefield;
    const classNames = 'zone' + (isTargetZone ? ' darken' : '');
    return (
        <div id={Zone.Battlefield} className={classNames}>
            {contents.map(card => {
                const isDragging = card.id === drag?.card.id;
                return <Card
                    key={card.id}
                    info={card}
                    darken={isTargetZone && !isDragging}
                    onDragStart={() => false}
                    onDragStop={() => false}
                />
            })}
        </div>
    );
};
