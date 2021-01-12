import { ZoneName } from './gameLayout';
import { Arrangement, CoreZoneProps, Zone } from './zone';

export const Library = (props: CoreZoneProps) => {
    return <Zone 
        {...props}
        name={ZoneName.Library} 
        arrangement={Arrangement.HorizontalOverlap} 
        faceDown={true} 
        maxToShow={2}
    />;
};

