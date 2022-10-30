import { useState } from 'react';
import { DeckInfo } from '../../services/dbSvc';
import { DeckInfoService } from '../../services/deckInfoSvc';
import { IconButton, InputAdornment, styled, TextField } from '@mui/material';
import { Add } from '@mui/icons-material';

interface DeckImportProps {
    onImport(value: DeckInfo): void;
}

const CssTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: 'transparent',
        },
    },
});

export const DeckImport = ({ onImport }: DeckImportProps) => {
    const [value, setValue] = useState('');
    const isDisabled = value === '';
    const doImport = async () => {
        if (isDisabled) return;
        onImport(await DeckInfoService.getDecklist(value));
        setValue('');
    };

    const fireKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        switch (e.key) {
            case 'Enter':
                doImport();
                break;
            case 'Escape':
                setValue('');
                break;
        }
    };

    return (
        <CssTextField
            placeholder='Enter Moxfield deck address'
            InputProps={{
                endAdornment: (
                    <InputAdornment position='end'>
                        <IconButton
                            aria-label='import deck'
                            edge='end'
                            disabled={isDisabled}
                            onClick={doImport}
                            sx={{ color: 'var(--nord14)' }} 
                        >
                            <Add />
                        </IconButton>
                    </InputAdornment>
                ),
            }}
            sx={{ width: '100%' }}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={fireKeyDown}
        />
    );
};
