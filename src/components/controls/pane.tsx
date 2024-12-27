import { Paper, styled } from "@mui/material";
import { CARD_HEIGHT_PX, CARD_WIDTH_PX, PaneBgStyle, ZONE_BORDER_PX, ZONE_PADDING_PX } from "../../global/constants";

export const Pane = styled(Paper)(() => ({
    ...PaneBgStyle,
    minWidth: CARD_WIDTH_PX,
    minHeight: CARD_HEIGHT_PX,
    position: 'relative',
    margin: ZONE_BORDER_PX,
    padding: ZONE_PADDING_PX,
}));
