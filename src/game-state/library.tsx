import { ZoneName } from './gameLayout';
import { CardPosition, CoreZoneProps, Zone } from './zone';

export const Library = (props: CoreZoneProps) => {
    return <Zone 
        {...props}
        name={ZoneName.Library} 
        cardPosition={CardPosition.ShowTopFaceDown}  
    />;
};

