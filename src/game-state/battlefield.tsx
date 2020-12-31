import { ZoneName } from "./gameLayout";
import { CardPosition, CoreZoneProps, Zone } from "./zone";

export const Battlefield = (props: CoreZoneProps) => {
    return <Zone 
        {...props}
        name={ZoneName.Battlefield} 
        cardPosition={CardPosition.Manual}  
    />;
};
