import { Close, OpenInNew, Sync } from '@mui/icons-material';
import { FormGroup, MenuItem } from '@mui/material';
import { useState } from 'react';
import { DatabaseService, DeckInfo } from '../../services/dbSvc';
import { FetchDecklist } from '../../services/deckInfoSvc';
import { InputButton } from '../controls/inputButton';
import { StyledTextField } from '../controls/styledTextField';

interface DeckSelectProps {
    decks: DeckInfo[];
    selectedIndex: number;
    onUpdateDecksAndSelection(index: number, updatedDeckInfos?: DeckInfo[]): void;
}

export const DeckSelect = ({
    decks,
    selectedIndex,
    onUpdateDecksAndSelection,
}: DeckSelectProps) => {
    const [isSyncing, setIsSyncing] = useState(false);
    const [isSyncError, setIsSyncError] = useState(false);

    const removeDeck = () => {
        const deckToRemove = decks[selectedIndex].name;
        DatabaseService.deleteDeck(deckToRemove);

        const updatedDeckInfos = decks.filter((di: DeckInfo) => di.name !== deckToRemove);
        let newSelectedIndex = decks.findIndex((di: DeckInfo) => di.name === deckToRemove);
        newSelectedIndex =
            newSelectedIndex <= updatedDeckInfos.length - 1
                ? newSelectedIndex
                : newSelectedIndex - 1;
        onUpdateDecksAndSelection(newSelectedIndex, updatedDeckInfos);
    };

    const syncDeck = async () => {
        setIsSyncing(true);
        {
            const deckToUpdate = decks[selectedIndex];
            const updatedDeck = await FetchDecklist(deckToUpdate.url);

            // If deck failed to sync:
            if (!updatedDeck) {
                setIsSyncError(true);
            } else {
                setIsSyncError(false);
                DatabaseService.deleteDeck(deckToUpdate.name);
                const updatedListOfDecks = decks
                    .slice(undefined, selectedIndex)
                    .concat([updatedDeck!])
                    .concat(decks.slice(selectedIndex + 1));
                onUpdateDecksAndSelection(selectedIndex, updatedListOfDecks);
            }
        }
        setIsSyncing(false);
    };

    const disabled = decks.length === 0;
    return (
        <FormGroup row>
            <StyledTextField
                select
                value={disabled ? '' : selectedIndex.toString()}
                disabled={disabled}
                onChange={(e) => onUpdateDecksAndSelection(+e.target.value)}
            >
                {decks.map((deck, index) => (
                    <MenuItem key={index} value={index} sx={{ fontSize: '0.8rem' }}>
                        {deck.name}
                    </MenuItem>
                ))}
            </StyledTextField>
            <InputButton
                tooltip={isSyncError ? 'Sync failed' : 'Sync from Moxfield'}
                disabled={disabled}
                sx={{ color: isSyncError ? 'var(--nord11)' : 'var(--nord14)' }}
                onClick={syncDeck}
            >
                <div style={{ transform: 'scaleX(-1)', height: '24px' }}>
                    <Sync className={isSyncing ? 'spin' : undefined} />
                </div>
            </InputButton>
            <InputButton
                tooltip='Open in Moxfield'
                disabled={disabled}
                link={disabled ? undefined : decks[selectedIndex].url}
            >
                <OpenInNew />
            </InputButton>
            <InputButton tooltip='Remove' disabled={disabled} onClick={removeDeck}>
                <Close />
            </InputButton>
        </FormGroup>
    );
};
