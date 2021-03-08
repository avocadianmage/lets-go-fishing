import { useEffect, useState } from 'react';
import { DatabaseService, DeckInfo } from '../services/dbSvc';
import { DeckInfoService } from '../services/deckInfoSvc';
import './css/lefter.css';

interface LefterProps {
    onDeckSelect(deckInfo: DeckInfo): void;
}

export const Lefter = ({ onDeckSelect }: LefterProps) => {
    const [importValue, setImportValue] = useState('');

    const [deckInfos, setDeckInfos] = useState<DeckInfo[]>([]);
    const updateDeckInfos = (value: DeckInfo[]) => {
        setDeckInfos(value.sort((a, b) => a.name.localeCompare(b.name)));
    }

    const [selectedDeck, setSelectedDeck] = useState<DeckInfo>();
    const updateSelectedDeck = (value: DeckInfo) => {
        setSelectedDeck(value);
        onDeckSelect(value);
    };

    const isInvalidUrlFormat = !importValue.startsWith('https://www.moxfield.com/decks/');
    const doImport = async () => {
        if (isInvalidUrlFormat) return;
        const deckInfo = await DeckInfoService.getDecklist(importValue);
        updateDeckInfos(deckInfos.concat(deckInfo));
        updateSelectedDeck(deckInfo);
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
        const deckInfo = deckInfos.find(di => di.name === deckName)!;
        updateSelectedDeck(deckInfo);
    }

    const loadDecks = async () => {
        let decks = (await DatabaseService.getDecks());
        updateDeckInfos(decks);
        if (decks.length > 0) updateSelectedDeck(decks[0]); // Load the first deck for now.
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { loadDecks() }, []);

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

            <select 
                className='control select' 
                size={4}
                value={selectedDeck?.name}
                onChange={fireDeckSelectChange}
            >
                {deckInfos.map(di => (
                    <option key={di.name} value={di.name}>{di.name}</option>
                ))}
            </select>

        </div>
    );
};
