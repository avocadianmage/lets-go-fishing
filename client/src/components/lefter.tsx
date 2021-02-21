import { useState } from 'react';
import './css/lefter.css';

interface LefterProps {
    onImport(importValue: string): void;
}

export const Lefter = ({ onImport }: LefterProps) => {
    const [importValue, setImportValue] = useState('');
    const isInvalidUrlFormat = !importValue.startsWith('https://www.moxfield.com/decks/');

    const doImport = () => {
        if (isInvalidUrlFormat) return;
        onImport(importValue);
        setImportValue('');
    };

    const fireKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        switch (e.key) {
            case 'Enter':
                doImport();
                break;
            case 'Escape':
                setImportValue('')
                break;
        }
    };

    return (
        <div id='lefter' className='pane'>

            {/* Deck import control */}
            <div style={{ position: 'relative' }}>
                <input
                    className='textfield'
                    type='text'
                    placeholder='Enter Moxfield deck address'
                    value={importValue}
                    onChange={(e) => setImportValue(e.target.value)}
                    onKeyDown={fireKeyDown}
                />
                <button
                    className='textfield-button'
                    disabled={isInvalidUrlFormat}
                    onClick={doImport}
                />
            </div>

        </div>
    );
};
