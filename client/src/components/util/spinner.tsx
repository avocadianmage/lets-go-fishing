import { Box, CircularProgress } from '@mui/material';

export const Spinner = () => (
    <Box sx={{ position: 'absolute', top: 'calc(50% - 40px)', left: 'calc(50% - 40px)' }}>
        <CircularProgress
            sx={{
                color: 'var(--nord4)',
                animationDuration: '750ms',
            }}
            size={80}
            thickness={6}
        />
    </Box>
);
