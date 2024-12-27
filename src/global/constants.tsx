import { SxProps, Theme, TypographyProps } from '@mui/material';
import { CSSProperties } from 'react';

// Layout
export const [CARD_WIDTH_PX, CARD_HEIGHT_PX] = [244, 340];
export const ZONE_PADDING_PX = 6;
export const ZONE_BORDER_PX = 2;

// Styles
export const LightestBgStyle: CSSProperties = {
    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.22))',
};
export const PaneBgStyle: CSSProperties = {
    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.11))',
};
export const CardHeaderTypographyProps: TypographyProps = {
    fontSize: '0.75rem',
    color: (theme: Theme) => theme.palette.grey[500],
    textTransform: 'uppercase',
};
export const ModalStyle: SxProps<Theme> = {
    position: 'absolute',
    top: '20%',
    left: '50%',
    transform: 'translate(-50%, -20%)',
    bgcolor: 'background.default',
    p: '12px',
};

// Gameplay
export const STARTING_LIFE = 40;
export const STARTING_HAND_SIZE = 7;
