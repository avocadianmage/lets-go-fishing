import { DatabaseService, DeckInfo } from '../../services/dbSvc';
import { Box, IconButton, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { OpenInNew, Remove } from '@mui/icons-material';

interface DeckSelectProps {
    decks: DeckInfo[];
    selectedIndex: number;
    onUpdateDecksAndSelection(index: number, updatedDeckInfos?: DeckInfo[]): void;
}

const fireDeckEdit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, deck: DeckInfo) => {
    e.stopPropagation();
    window.open(deck.url, '_blank');
};

export const DeckSelect = ({
    decks,
    selectedIndex,
    onUpdateDecksAndSelection,
}: DeckSelectProps) => {
    const fireDeckRemove = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, index: number) => {
        e.stopPropagation();

        const deckToRemove = decks[index].name;
        DatabaseService.deleteDeck(deckToRemove);

        const updatedDeckInfos = decks.filter((di: DeckInfo) => di.name !== deckToRemove);
        let selectedIndex = decks.findIndex((di: DeckInfo) => di.name === deckToRemove);
        selectedIndex =
            selectedIndex <= updatedDeckInfos.length - 1 ? selectedIndex : selectedIndex - 1;
        onUpdateDecksAndSelection(selectedIndex, updatedDeckInfos);
    };

    return (
        <Box sx={{ height: 250, maxHeight: 250, overflow: 'auto' }}>
            <List>
                {decks.map((deck, index) => (
                    <ListItem key={index} disablePadding onFocus={(e) => e.target.blur()}>
                        <ListItemButton
                            selected={selectedIndex === index}
                            onClick={() => onUpdateDecksAndSelection(index)}
                            sx={{ '&:hover': { '& svg': { opacity: 1 } } }}
                        >
                            <ListItemText primary={deck.name} />
                            <IconButton
                                aria-label='open deck in moxfield'
                                edge='end'
                                onClick={(e) => fireDeckEdit(e, deck)}
                            >
                                <OpenInNew sx={{ opacity: 0 }} />
                            </IconButton>
                            <IconButton
                                aria-label='remove deck'
                                edge='end'
                                onClick={(e) => fireDeckRemove(e, index)}
                                sx={{ color: 'var(--nord11)' }}
                            >
                                <Remove sx={{ opacity: 0 }} />
                            </IconButton>
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};
