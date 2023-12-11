import './App.css';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { GameLayout } from './components/gameLayout/gameLayout';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
    typography: {
        fontFamily: [
            '"Noto Sans"',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            'Oxygen',
            'Ubuntu',
            'Cantarell',
            '"Fira Sans"',
            '"Droid Sans"',
            '"Helvetica Neue"',
            'sans-serif',
        ].join(','),
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    '&.Mui-focusVisible': {
                        backgroundColor: 'color-mix(in srgb, currentColor, transparent 82%)',
                    },
                    '& .MuiTouchRipple-root': {
                        display: 'none',
                    },
                },
            },
        },
    },
});

export default function App() {
    return (
        <ThemeProvider theme={darkTheme}>
            <GameLayout />
        </ThemeProvider>
    );
}
