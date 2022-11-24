import { Paper, Typography, Divider, TypographyProps, Box } from '@mui/material';

const SingleShortcut = (props: TypographyProps) => (
    <Typography variant='overline' lineHeight={1} {...props}>
        {props.children}
    </Typography>
);

const shortcutColProps = {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    p: '8px 0',
};
export const Shortcuts = () => (
    <Paper sx={{ marginBottom: '16px', p: '4px 12px' }}>
        <Typography variant='overline'>Keyboard shortcuts</Typography>
        <Divider sx={{ marginBottom: '3px' }} />

        <Box sx={{ display: 'flex' }}>
            <Box sx={shortcutColProps}>
                <SingleShortcut>R – Restart</SingleShortcut>
                <SingleShortcut>N – Next turn</SingleShortcut>
            </Box>
            <Box sx={shortcutColProps}>
                <SingleShortcut>D – Draw</SingleShortcut>
                <SingleShortcut>U – Untap all</SingleShortcut>
            </Box>
        </Box>
    </Paper>
);
