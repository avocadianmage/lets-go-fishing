import { ZoneName } from "./gameLayout";
import { CoreZoneProps, Zone } from "./zone";

export const Battlefield = (props: CoreZoneProps) => {
    return <Zone name={ZoneName.Battlefield} {...props} />;
};
