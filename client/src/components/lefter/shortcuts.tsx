import { Box, Divider, Paper, Typography } from '@mui/material';

const SingleShortcut = (props: { shortcutKey: string; description: string }) => (
    <Typography variant='overline' lineHeight={1}>
        {props.shortcutKey + ' \u{2014} ' + props.description}
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
                <SingleShortcut shortcutKey='R' description='restart game' />
                <SingleShortcut shortcutKey='L' description='search library' />
                <SingleShortcut shortcutKey='S' description='shuffle library' />
            </Box>
            <Box sx={shortcutColProps}>
                <SingleShortcut shortcutKey='N' description='next turn' />
                <SingleShortcut shortcutKey='U' description='untap all' />
                <SingleShortcut shortcutKey='D' description='draw one' />
            </Box>
        </Box>
    </Paper>
);
