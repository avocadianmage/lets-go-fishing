import { Add } from '@mui/icons-material';
import { CircularProgress, FormGroup, TextField } from '@mui/material';
import { forwardRef, useState } from 'react';
import { DeckInfo } from '../../services/dbSvc';
import { FetchDecklist } from '../../services/deckInfoSvc';
import { InputButton } from '../controls/inputButton';
import { StyledTextField } from '../controls/styledTextField';

interface DeckImportProps {
    decks: DeckInfo[];
    onImport(value: DeckInfo): void;
}

export const DeckImport = forwardRef(({ decks, onImport }: DeckImportProps, ref) => {
    const [value, setValue] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const updateInput = (input: string) => {
        setValue(input);
        setErrorMessage('');
    };

    const isDisabled = value === '';

    const doImport = async () => {
        if (isDisabled) return;

        let deck = decks.find((d) => d.url === value);
        if (!deck) {
            setLoading(true);
            deck = await FetchDecklist(value);
            setLoading(false);
        }

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
        <FormGroup row>
            <StyledTextField
                inputRef={ref}
                placeholder='Enter Moxfield deck URL'
                value={value}
                error={!!errorMessage}
                helperText={errorMessage}
                FormHelperTextProps={{ sx: { marginBottom: '4px' } }}
                onChange={(e) => updateInput(e.target.value)}
                onKeyDown={fireKeyDown}
            />
            <InputButton
                tooltip='Import deck'
                disabled={isDisabled}
                onClick={doImport}
                sx={{ color: 'var(--nord14)' }}
            >
                {loading ? <CircularProgress size={24} /> : <Add />}
            </InputButton>
        </FormGroup>
    );
});
