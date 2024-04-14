import { Close, OpenInNew, Sync } from '@mui/icons-material';
import { List, ListItemButton, ListItemText } from '@mui/material';
import { useState } from 'react';
import { DatabaseService, DeckInfo } from '../../services/dbSvc';
import { FetchDecklist } from '../../services/deckInfoSvc';
import { InputButton } from '../controls/inputButton';

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
    const [syncingDeckIndex, setSyncingDeckIndex] = useState(-1);
    const [syncErrorDeckIndex, setSyncErrorDeckIndex] = useState(-1);

    const removeDeck = (index: number) => {
        const deckToRemove = decks[index].name;
        DatabaseService.deleteDeck(deckToRemove);

        const updatedDeckInfos = decks.filter((di: DeckInfo) => di.name !== deckToRemove);

        let newSelectedIndex = selectedIndex;
        if (index <= selectedIndex) {
            newSelectedIndex = selectedIndex - 1;
            if (newSelectedIndex === -1 && updatedDeckInfos.length > 0) newSelectedIndex = 0;
        }

        onUpdateDecksAndSelection(newSelectedIndex, updatedDeckInfos);
    };

    const syncDeck = async (index: number) => {
        // Only allow one deck to sync at a time.
        if (syncingDeckIndex !== -1) return;

        setSyncingDeckIndex(index);
        {
            const deckToUpdate = decks[index];
            const updatedDeck = await FetchDecklist(deckToUpdate.url);

            if (!updatedDeck) {
                setSyncErrorDeckIndex(index);
            } else {
                setSyncErrorDeckIndex(-1);
                DatabaseService.deleteDeck(deckToUpdate.name);
                const updatedListOfDecks = decks
                    .slice(undefined, index)
                    .concat([updatedDeck!])
                    .concat(decks.slice(index + 1));
                onUpdateDecksAndSelection(index, updatedListOfDecks);
            }
        }
        setSyncingDeckIndex(-1);
    };

    const disabled = decks.length === 0;
    return (
        <List
            component='nav'
            sx={{
                p: disabled ? 0 : '0px 0px 4px 0px',
                maxHeight: 'calc(36px * 8)',
                overflowY: 'scroll',
            }}
        >
            {decks.map((deck, index) => {
                const isSelected = selectedIndex === index;
                const isSyncing = syncingDeckIndex === index;
                const hasSyncError = syncErrorDeckIndex === index;
                return (
                    <div
                        key={index}
                        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}
                    >
                        <ListItemButton
                            selected={isSelected}
                            disableRipple
                            sx={{ p: '4px 2px 4px 14px' }}
                            onClick={() => onUpdateDecksAndSelection(index)}
                        >
                            <ListItemText
                                primaryTypographyProps={{ fontSize: '0.8rem', noWrap: true }}
                                primary={deck.name}
                                sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                            />

                            <InputButton
                                tooltip={hasSyncError ? 'Sync failed' : 'Sync from Moxfield'}
                                disabled={disabled}
                                sx={{
                                    p: '2px',
                                    color: hasSyncError ? 'var(--nord11)' : 'var(--nord14)',
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    syncDeck(index);
                                }}
                            >
                                <div style={{ transform: 'scaleX(-1)', height: '20px' }}>
                                    <Sync
                                        sx={{ fontSize: 20 }}
                                        className={isSyncing ? 'spin' : undefined}
                                    />
                                </div>
                            </InputButton>

                            <InputButton
                                tooltip='Open in Moxfield'
                                disabled={disabled}
                                sx={{ p: '2px' }}
                                link={disabled ? undefined : decks[index].url}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <OpenInNew sx={{ fontSize: 20 }} />
                            </InputButton>

                            <InputButton
                                tooltip='Remove'
                                disabled={disabled}
                                sx={{ p: '5px', color: 'var(--nord15)' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeDeck(index);
                                }}
                            >
                                <Close sx={{ fontSize: 14 }} />
                            </InputButton>
                        </ListItemButton>
                    </div>
                );
            })}
        </List>
    );
};
