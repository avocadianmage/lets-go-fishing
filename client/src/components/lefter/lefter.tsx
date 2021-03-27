import { useEffect, useState } from 'react';
import { DatabaseService, DeckInfo } from '../../services/dbSvc';
import { DeckImport } from './deckImport';

import '../css/lefter.css';

interface LefterProps {
    onDeckSelect(deckInfo?: DeckInfo): void;
}

export const Lefter = ({ onDeckSelect }: LefterProps) => {
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

    const fireDeckEditClick = () => {
        window.open(selectedDeck?.url, '_blank');
    }

    const doImport = (deckInfo: DeckInfo) => {
        updateDeckInfos(deckInfos.concat(deckInfo));
        updateSelectedDeck(deckInfo);
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

            <DeckImport onImport={doImport} />

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
                    <button
                        className='textfield-button deck-selection-button remove-icon'
                        disabled={!selectedDeck}
                        onClick={fireDeckRemoveClick}
                    />
                    <button
                        className='textfield-button deck-selection-button edit-icon'
                        disabled={!selectedDeck}
                        onClick={fireDeckEditClick}
                    />
                </div>
            </div>
        </div>
    );
};
