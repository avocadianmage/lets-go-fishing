import { Zone } from "./gameLayout";

interface BattlefieldProps {
    isDraggedOver: boolean;
}

export const Battlefield = ({ isDraggedOver }: BattlefieldProps) => {
    const classNames = 'battlefield zone' + 
        (isDraggedOver ? ' drag-over' : '');
    return <div id={Zone.Battlefield} className={classNames} />;
};
