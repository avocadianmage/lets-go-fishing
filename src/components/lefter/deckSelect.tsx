import { ArrowUpward, Close, OpenInNew, Sync } from '@mui/icons-material';
import { Box, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { useState } from 'react';
import { DatabaseService, DeckInfo } from '../../services/dbSvc';
import { FetchDecklist } from '../../services/deckInfoSvc';
import { InputButton } from '../controls/inputButton';

const DECK_SELECT_HEIGHT = 250;

interface DeckSelectProps {
    decks: DeckInfo[];
    selectedIndex: number;
    onUpdateDecksAndSelection(index: number, updatedDeckInfos?: DeckInfo[]): void;
    onClickPlaceholder(): void;
}

export const DeckSelect = ({
    decks,
    selectedIndex,
    onUpdateDecksAndSelection,
    onClickPlaceholder,
}: DeckSelectProps) => {
    const [syncingIndex, setSyncingIndex] = useState(-1);
    const [syncErrorIndex, setSyncErrorIndex] = useState(-1);

    const onDeckRemove = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, index: number) => {
        e.stopPropagation();

        const deckToRemove = decks[index].name;
        DatabaseService.deleteDeck(deckToRemove);

        const updatedDeckInfos = decks.filter((di: DeckInfo) => di.name !== deckToRemove);
        let selectedIndex = decks.findIndex((di: DeckInfo) => di.name === deckToRemove);
        selectedIndex =
            selectedIndex <= updatedDeckInfos.length - 1 ? selectedIndex : selectedIndex - 1;
        onUpdateDecksAndSelection(selectedIndex, updatedDeckInfos);
    };

    const onDeckSync = async (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
        index: number
    ) => {
        e.stopPropagation();
        setSyncingIndex(index);
        {
            const deckToUpdate = decks[index];
            const updatedDeck = await FetchDecklist(deckToUpdate.url);

            // If deck failed to sync:
            if (!updatedDeck) {
                setSyncErrorIndex(index);
            } else {
                setSyncErrorIndex(-1);
                DatabaseService.deleteDeck(deckToUpdate.name);
                const updatedListOfDecks = decks
                    .slice(undefined, index)
                    .concat([updatedDeck!])
                    .concat(decks.slice(index + 1));
                onUpdateDecksAndSelection(selectedIndex, updatedListOfDecks);
            }
        }
        setSyncingIndex(-1);
    };

    const ListOfDecks = () => (
        <List>
            {decks.map((deck, index) => (
                <ListItem key={index} disablePadding>
                    <ListItemButton
                        selected={selectedIndex === index}
                        onClick={() => onUpdateDecksAndSelection(index)}
                        sx={{ paddingLeft: '14px', paddingRight: '11px' }}
                    >
                        <ListItemText
                            primary={deck.name}
                            primaryTypographyProps={{ fontSize: '0.8rem' }}
                        />
                        <InputButton
                            title='Sync from Moxfield'
                            onClick={(e) => onDeckSync(e, index)}
                            sx={{
                                transform: 'scaleX(-1) rotate(90deg)',
                                color: syncErrorIndex === index ? 'var(--nord11)' : undefined,
                            }}
                        >
                            <Sync className={syncingIndex === index ? 'spin' : undefined} />
                        </InputButton>
                        <InputButton
                            title='Open in Moxfield'
                            link={deck.url}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <OpenInNew />
                        </InputButton>
                        <InputButton title='Remove deck' onClick={(e) => onDeckRemove(e, index)}>
                            <Close />
                        </InputButton>
                    </ListItemButton>
                </ListItem>
            ))}
        </List>
    );

    return (
        <Box sx={{ height: DECK_SELECT_HEIGHT, maxHeight: DECK_SELECT_HEIGHT, overflow: 'auto' }}>
            {decks.length > 0 ? (
                <ListOfDecks />
            ) : (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: DECK_SELECT_HEIGHT,
                        cursor: 'pointer',
                    }}
                    onClick={onClickPlaceholder}
                >
                    <div>
                        <ArrowUpward
                            className='verticalWave'
                            style={{ fontSize: '3rem', width: '100%', color: 'var(--nord13)' }}
                        />
                        <h4>Import a deck</h4>
                    </div>
                </div>
            )}
        </Box>
    );
};
