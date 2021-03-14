import { useState } from 'react';
import { DeckInfo } from '../../services/dbSvc';
import { DeckInfoService } from '../../services/deckInfoSvc';

interface DeckImportProps {
    onImport(value: DeckInfo): void;
}

export const DeckImport = ({ onImport }: DeckImportProps) => {
    const [value, setValue] = useState('');
    const isDisabled = value == '';
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
        <div style={{ position: 'relative' }}>
            <input
                className='control outline textfield'
                type='text'
                placeholder='Enter Moxfield deck address'
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={fireKeyDown}
            />
            <button
                className='textfield-button add-icon'
                style={{ position: 'absolute', top: '3px', right: '3px' }}
                disabled={isDisabled}
                onClick={doImport}
            />
        </div>
    );
};
