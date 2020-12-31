import { CardInfo } from "../services/dbSvc";
import { Card, DragInfo } from "./card";
import { Zone } from "./gameLayout";

interface BattlefieldProps {
    contents: CardInfo[];
    drag?: DragInfo;
}

export const Battlefield = ({ contents, drag }: BattlefieldProps) => {
    const isTargetZone = drag?.targetZone === Zone.Battlefield;
    const classNames = 'battlefield zone' + (isTargetZone ? ' darken' : '');
    return (
        <div id={Zone.Battlefield} className={classNames}>
            {contents.map(card => {
                return <Card
                    key={card.id}
                    info={card}
                    darken={isTargetZone}
                    onDragStart={() => false}
                    onDragStop={() => false}
                />
            })}
        </div>
    );
};
