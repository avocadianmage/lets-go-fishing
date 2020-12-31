import { ZoneName } from './gameLayout';
import { CardPosition, CoreZoneProps, Zone } from './zone';

export const Hand = (props: CoreZoneProps) => {
    return <Zone 
        {...props}
        name={ZoneName.Hand} 
        cardPosition={CardPosition.HorizontallyStacked}  
    />;
};
