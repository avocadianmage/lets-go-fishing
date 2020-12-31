import { ZoneName } from "./gameLayout";
import { Arrangement, CoreZoneProps, Zone } from "./zone";

export const Battlefield = (props: CoreZoneProps) => {
    return <Zone 
        {...props}
        name={ZoneName.Battlefield} 
        arrangement={Arrangement.Manual}  
    />;
};
