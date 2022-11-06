import React, { useEffect, useRef, useState } from 'react';
import { DatabaseService, DeckInfo } from '../../services/dbSvc';
import { DeckImport } from './deckImport';
import { CardContent, Divider, Paper } from '@mui/material';
import { DeckSelect } from './deckSelect';
import { Pane } from '../gameLayout/gameLayout';
import { NumberWheel } from './numberWheel';
import { Favorite } from '@mui/icons-material';

import ManaWhite from '../../assets/mana-white.svg';
import ManaBlue from '../../assets/mana-blue.svg';
import ManaBlack from '../../assets/mana-black.svg';
import ManaRed from '../../assets/mana-red.svg';
import ManaGreen from '../../assets/mana-green.svg';
import ManaColorless from '../../assets/mana-colorless.svg';

interface LefterProps {
    onDeckSelect(deckInfo?: DeckInfo): void;
}

const cardSpacingStyle: React.CSSProperties = { textAlign: 'center', marginBottom: '16px' };

export const Lefter = ({ onDeckSelect }: LefterProps) => {
    const deckImportRef = useRef<HTMLInputElement>(null);

    const [decks, setDecks] = useState<DeckInfo[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const updateDecksAndSelection = (index: number, updatedDecks?: DeckInfo[]) => {
        updatedDecks = updatedDecks ?? decks;
        const selectedDeck = updatedDecks.length === 0 ? undefined : updatedDecks[index];
        DatabaseService.putSelectedDeckName(selectedDeck?.name ?? '');
        setDecks(updatedDecks);
        setSelectedIndex(index);
        onDeckSelect(selectedDeck);
    };

    const addDeck = (deckInfo: DeckInfo) => {
        updateDecksAndSelection(decks.length, decks.concat(deckInfo));
    };

    useEffect(() => {
        const fetchDecks = async () => {
            const decks = await DatabaseService.getDecks();
            const nameToSelect = DatabaseService.getSelectedDeckName();
            const indexToSelect = Math.max(
                0,
                decks.findIndex((di) => di.name === nameToSelect)
            );
            updateDecksAndSelection(indexToSelect, decks);
        };
        fetchDecks();

        // Run useEffect only once.
        // eslint-disable-next-line
    }, []);

    return (
        <Pane id='lefter'>
            <CardContent>
                <h1 style={{ margin: 6, marginBottom: 16 }}>Let's Go Fishing</h1>

                <Paper sx={cardSpacingStyle}>
                    <DeckImport ref={deckImportRef} onImport={addDeck} />
                    <Divider />
                    <DeckSelect
                        decks={decks}
                        selectedIndex={selectedIndex}
                        onUpdateDecksAndSelection={updateDecksAndSelection}
                        onClickPlaceholder={() => deckImportRef.current?.focus()}
                    />
                </Paper>

                <Paper sx={{...cardSpacingStyle, display: 'flex'}}>
                    <NumberWheel
                        label='life'
                        icon={<Favorite sx={{ color: 'var(--nord15)' }} />}
                        defaultCount={40}
                    />
                    <NumberWheel label='white mana' icon={<img src={ManaWhite} />} />
                    <NumberWheel label='blue mana' icon={<img src={ManaBlue} />} />
                    <NumberWheel label='black mana' icon={<img src={ManaBlack} />} />
                    <NumberWheel label='red mana' icon={<img src={ManaRed} />} />
                    <NumberWheel label='green mana' icon={<img src={ManaGreen} />} />
                    <NumberWheel label='colorless mana' icon={<img src={ManaColorless} />} />
                </Paper>
            </CardContent>
        </Pane>
    );
};
