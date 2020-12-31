import { CardInfo } from "../services/dbSvc";
import { Card, DragInfo } from "./card";
import { Zone } from "./gameLayout";

interface BattlefieldProps {
    contents: CardInfo[];
    drag?: DragInfo;
}

export const Battlefield = ({ contents, drag }: BattlefieldProps) => {
    const classNames = 'battlefield zone' +
        (drag?.targetZone === Zone.Battlefield ? ' drag-over' : '');
    return (
        <div id={Zone.Battlefield} className={classNames}>
            {contents.map(cardInfo => {
                return <Card
                    key={cardInfo.id}
                    info={cardInfo}
                    onDragStart={() => false}
                    onDragStop={() => false}
                />
            })}
        </div>
    );
};
