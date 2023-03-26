import { Box, Divider, Paper, Theme, Typography, TypographyProps } from '@mui/material';

const grayText = (theme: Theme) => theme.palette.grey[600];
const shortcutTypographyProps: TypographyProps = {
    variant: 'overline',
    lineHeight: 1,
};
const shortcutColProps = {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    p: '8px 0',
};

const SingleShortcut = (props: { shortcutKey: string; description: string }) => (
    <Typography {...shortcutTypographyProps}>
        {props.shortcutKey}
        <Typography {...shortcutTypographyProps} color={grayText}>
            {'\u{00A0}\u{2014}\u{00A0}'}
        </Typography>
        {props.description}
    </Typography>
);

export const Shortcuts = () => (
    <Paper
        sx={{
            p: '4px 12px',
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            width: 'calc(100% - 56px)',
        }}
    >
        <Typography variant='overline' color={grayText}>
            Keyboard shortcuts
        </Typography>
        <Divider sx={{ marginBottom: '3px' }} />

        <Box sx={{ display: 'flex' }}>
            <Box sx={shortcutColProps}>
                <SingleShortcut shortcutKey='R' description='restart game' />
                <SingleShortcut shortcutKey='L' description='search library' />
                <SingleShortcut shortcutKey='G' description='search graveyard' />
                <SingleShortcut shortcutKey='E' description='search exile' />
                <SingleShortcut shortcutKey='H' description='search hand' />
            </Box>
            <Box sx={shortcutColProps}>
                <SingleShortcut shortcutKey='N' description='next turn' />
                <SingleShortcut shortcutKey='U' description='untap all' />
                <SingleShortcut shortcutKey='D' description='draw one' />
                <SingleShortcut shortcutKey='S' description='shuffle library' />
                <SingleShortcut shortcutKey='B' description='put card on bottom' />
            </Box>
        </Box>
    </Paper>
);
