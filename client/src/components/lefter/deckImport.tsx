import { useState } from 'react';
import { DeckInfo } from '../../services/dbSvc';
import { DeckInfoService } from '../../services/deckInfoSvc';
import { IconButton, InputAdornment, Paper, TextField } from '@mui/material';
import { Add } from '@mui/icons-material';

interface DeckImportProps {
    onImport(value: DeckInfo): void;
}

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
        <Paper>
            <TextField
                placeholder='Enter Moxfield deck address'
                InputProps={{
                    endAdornment: (
                        <InputAdornment position='end'>
                            <IconButton
                                aria-label='import deck'
                                edge='end'
                                sx={{ color: 'var(--nord14)' }}
                                disabled={isDisabled}
                                onClick={doImport}
                            >
                                <Add />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
                variant='outlined'
                sx={{ width: '100%' }}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={fireKeyDown}
            />
        </Paper>
    );
};
