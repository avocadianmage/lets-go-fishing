import { CardInfo } from "../services/dbSvc";
import { Card } from "./card";
import { Zone } from "./gameLayout";

interface BattlefieldProps {
    contents: CardInfo[];
    isDraggedOver: boolean;
}

export const Battlefield = ({ isDraggedOver, contents }: BattlefieldProps) => {
    const classNames = 'battlefield zone' +
        (isDraggedOver ? ' drag-over' : '');
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
