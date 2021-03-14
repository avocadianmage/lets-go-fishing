import { useEffect, useState } from 'react';
import { DatabaseService, DeckInfo } from '../services/dbSvc';
import { DeckInfoService } from '../services/deckInfoSvc';
import './css/lefter.css';

interface LefterProps {
    onDeckSelect(deckInfo?: DeckInfo): void;
}

export const Lefter = ({ onDeckSelect }: LefterProps) => {
    const [importValue, setImportValue] = useState('');

    const [deckInfos, setDeckInfos] = useState<DeckInfo[]>([]);
    const updateDeckInfos = (value: DeckInfo[]) => {
        setDeckInfos(value.sort((a, b) => a.name.localeCompare(b.name)));
    };

    const [selectedDeck, setSelectedDeck] = useState<DeckInfo>();
    const updateSelectedDeck = (value?: DeckInfo) => {
        DatabaseService.putSelectedDeckName(value?.name ?? '');
        setSelectedDeck(value);
        onDeckSelect(value);
    };

    const [selectControlFocused, setSelectControlFocused] = useState<boolean>(false);

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
        const deckName = e.currentTarget.selectedOptions.item(0)?.value;
        const deckInfo = deckInfos.find((di) => di.name === deckName);
        updateSelectedDeck(deckInfo);
    };

    const fireDeckRemoveClick = () => {
        const deckToRemove = selectedDeck!.name;
        DatabaseService.deleteDeck(deckToRemove);

        const selectedIndex = deckInfos.findIndex((di: DeckInfo) => di.name === deckToRemove);
        const updatedDeckInfos = deckInfos.filter((di: DeckInfo) => di.name !== deckToRemove);
        const updatedSelectedIndex =
            selectedIndex <= updatedDeckInfos.length - 1 ? selectedIndex : selectedIndex - 1;
        updateDeckInfos(updatedDeckInfos);
        updateSelectedDeck(updatedDeckInfos[updatedSelectedIndex]);
    };

    const loadDecks = async () => {
        const decks = await DatabaseService.getDecks();
        const savedSelectedDeckName = DatabaseService.getSelectedDeckName();
        const deckToSelect = decks.find((di) => di.name === savedSelectedDeckName) ?? decks[0];
        updateDeckInfos(decks);
        updateSelectedDeck(deckToSelect);
    };

    useEffect(() => {
        loadDecks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div id='lefter' className='pane'>
            <div className='heading'>LET'S GO FISHING</div>

            <div style={{ position: 'relative' }}>
                <input
                    className='control outline textfield'
                    type='text'
                    placeholder='Enter Moxfield deck address'
                    value={importValue}
                    onChange={(e) => setImportValue(e.target.value)}
                    onKeyDown={fireDeckImportKeyDown}
                />
                <button
                    className='textfield-button add-icon'
                    style={{ position: 'absolute', top: '3px', right: '3px' }}
                    disabled={isInvalidUrlFormat}
                    onClick={doImport}
                />
            </div>

            <div
                className={`control outline ${selectControlFocused ? 'focused' : ''}`}
                style={{ display: 'flex', marginTop: '8px' }}
            >
                <select
                    className='control select'
                    style={{ flex: 1 }}
                    size={4}
                    value={selectedDeck?.name}
                    onChange={fireDeckSelectChange}
                    onFocus={() => setSelectControlFocused(true)}
                    onBlur={() => setSelectControlFocused(false)}
                >
                    {deckInfos.map((di) => (
                        <option key={di.name} value={di.name}>
                            {di.name}
                        </option>
                    ))}
                </select>
                <div>
                    <div style={{ padding: '2px' }}>
                        <button
                            className='textfield-button remove-icon'
                            disabled={!selectedDeck}
                            onClick={fireDeckRemoveClick}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
