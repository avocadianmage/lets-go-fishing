import { CircularProgress } from '@mui/material';

export const CenteredSpinner = ({ diameter }: { diameter: number }) => {
    const offset = `calc(50% - ${diameter / 2}px)`;
    return (
        <CircularProgress
            sx={{
                position: 'absolute',
                top: offset,
                left: offset,
                color: 'var(--nord4)',
                animationDuration: '750ms',
            }}
            thickness={6}
            size={diameter}
        />
    );
};
