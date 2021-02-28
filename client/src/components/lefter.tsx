import { useState } from 'react';
import { DeckInfo } from '../services/dbSvc';
import './css/lefter.css';

interface LefterProps {
    decks: DeckInfo[];
    onDeckImport(importValue: string): void;
    onDeckSelect(deck: DeckInfo): void;
}

export const Lefter = ({ decks, onDeckImport, onDeckSelect }: LefterProps) => {
    const [importValue, setImportValue] = useState('');
    const isInvalidUrlFormat = !importValue.startsWith('https://www.moxfield.com/decks/');

    const doImport = () => {
        if (isInvalidUrlFormat) return;
        onDeckImport(importValue);
        setImportValue('');
    };

    const fireDeckImportKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        switch (e.key) {
            case 'Enter':
                doImport();
                break;
            case 'Escape':
                setImportValue('');
                break;
        }
    };

    const fireDeckSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const deckName = e.currentTarget.selectedOptions.item(0)!.value;
        const deckInfo = decks.find(di => di.name === deckName)!;
        onDeckSelect(deckInfo);
    }

    return (
        <div id='lefter' className='pane'>
            <div className='heading'>LET'S GO FISHING</div>

            {/* Deck import control */}
            <div style={{ position: 'relative' }}>
                <input
                    className='control textfield'
                    type='text'
                    placeholder='Enter Moxfield deck address'
                    value={importValue}
                    onChange={(e) => setImportValue(e.target.value)}
                    onKeyDown={fireDeckImportKeyDown}
                />
                <button
                    className='textfield-button'
                    disabled={isInvalidUrlFormat}
                    onClick={doImport}
                />
            </div>

            <select className='control select' multiple onChange={fireDeckSelectChange}>
                {decks.map(di => (
                    <option key={di.name} value={di.name}>{di.name}</option>
                ))}
            </select>

        </div>
    );
};
