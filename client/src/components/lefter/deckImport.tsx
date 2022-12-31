import { Add } from '@mui/icons-material';
import { InputAdornment, styled, TextField } from '@mui/material';
import { forwardRef, useState } from 'react';
import { DeckInfo } from '../../services/dbSvc';
import { FetchDecklist } from '../../services/deckInfoSvc';
import { InputButton } from './inputButton';

interface DeckImportProps {
    decks: DeckInfo[];
    onImport(value: DeckInfo): void;
}

const CssTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: 'transparent',
        },
    },
});

export const DeckImport = forwardRef(({ decks, onImport }: DeckImportProps, ref) => {
    const [value, setValue] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const updateInput = (input: string) => {
        setValue(input);
        setErrorMessage('');
    };

    const isDisabled = value === '';

    const doImport = async () => {
        if (isDisabled) return;

        const deck = decks.find((d) => d.url === value) ?? (await FetchDecklist(value));
        if (!deck) {
            setErrorMessage('Unable to find deck.');
            return;
        }

        onImport(deck);
        updateInput('');
    };

    const fireKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        switch (e.key) {
            case 'Enter':
                doImport();
                break;
            case 'Escape':
                updateInput('');
                break;
        }
    };

    return (
        <CssTextField
            inputRef={ref}
            placeholder='Enter Moxfield deck address'
            inputProps={{ style: { fontSize: '0.8rem' } }}
            InputProps={{
                endAdornment: (
                    <InputAdornment position='end' sx={{ marginRight: '-3px' }}>
                        <InputButton
                            aria-label='import deck'
                            disabled={isDisabled}
                            onClick={doImport}
                            sx={{ color: 'var(--nord14)' }}
                        >
                            <Add />
                        </InputButton>
                    </InputAdornment>
                ),
            }}
            sx={{ width: '100%' }}
            value={value}
            error={!!errorMessage}
            helperText={errorMessage}
            FormHelperTextProps={{ sx: { marginBottom: '4px' } }}
            onChange={(e) => updateInput(e.target.value)}
            onKeyDown={fireKeyDown}
        />
    );
});
