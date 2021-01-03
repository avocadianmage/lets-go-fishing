import { ZoneName } from './gameLayout';
import { Arrangement, CoreZoneProps, Zone } from './zone';

export const Hand = (props: CoreZoneProps) => {
    return <Zone 
        {...props}
        name={ZoneName.Hand} 
        arrangement={Arrangement.HorizontalOverlap}  
    />;
};
