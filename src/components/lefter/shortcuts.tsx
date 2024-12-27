import { Box, BoxProps, Paper, SxProps, Typography, TypographyProps } from '@mui/material';
import { CSSProperties } from 'react';
import { CardHeaderTypographyProps, LightestBgStyle } from '../../global/constants';

const textProps: TypographyProps = {
    variant: 'overline',
    textTransform: 'none',
    height: '14px',
};
const keyCharStyle: CSSProperties = {
    ...LightestBgStyle,
    padding: '2px 5px',
    marginRight: '8px',
    borderRadius: '2px',
};
const cardSx: SxProps = {
    p: '0px 16px 22px 16px',
    position: 'absolute',
    bottom: '16px',
    left: '16px',
    width: 'calc(100% - 64px)',
};
const colProps: BoxProps = {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
};

const SingleShortcut = (props: { shortcutKey: string; description: string }) => (
    <Typography {...textProps}>
        <code style={keyCharStyle}>{props.shortcutKey}</code>
        <Typography {...textProps}>{props.description}</Typography>
    </Typography>
);

export const Shortcuts = () => (
    <Paper sx={cardSx}>
        <Typography {...CardHeaderTypographyProps} sx={{ pt: '12px', pb: '8px' }}>
            Keyboard shortcuts
        </Typography>

        <Box sx={{ display: 'flex' }}>
            <Box sx={colProps}>
                <SingleShortcut shortcutKey='R' description='restart game' />
                <SingleShortcut shortcutKey='L' description='search library' />
                <SingleShortcut shortcutKey='G' description='search graveyard' />
                <SingleShortcut shortcutKey='E' description='search exile' />
                <SingleShortcut shortcutKey='H' description='search hand' />
                <SingleShortcut shortcutKey='S' description='shuffle library' />
                <SingleShortcut shortcutKey='N' description='next turn' />
            </Box>
            <Box sx={colProps}>
                <SingleShortcut shortcutKey='U' description='untap all' />
                <SingleShortcut shortcutKey='D' description='draw one' />
                <SingleShortcut shortcutKey='B' description='put card on bottom' />
                <SingleShortcut shortcutKey='T' description='transform card' />
                <SingleShortcut shortcutKey='=' description='add +1/+1 counter' />
                <SingleShortcut shortcutKey='-' description='add −1/−1 counter' />
                <SingleShortcut shortcutKey='0' description='remove counters' />
            </Box>
        </Box>
    </Paper>
);
