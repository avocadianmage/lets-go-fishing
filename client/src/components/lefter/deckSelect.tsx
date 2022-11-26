import { ArrowUpward, OpenInNew, Remove } from '@mui/icons-material';
import {
    Box,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText
} from '@mui/material';
import { DatabaseService, DeckInfo } from '../../services/dbSvc';

const DECK_SELECT_HEIGHT = 250;

interface DeckSelectProps {
    decks: DeckInfo[];
    selectedIndex: number;
    onUpdateDecksAndSelection(index: number, updatedDeckInfos?: DeckInfo[]): void;
    onClickPlaceholder(): void;
}

const fireDeckEdit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, deck: DeckInfo) => {
    e.stopPropagation();
    window.open(deck.url, '_blank');
};

export const DeckSelect = ({
    decks,
    selectedIndex,
    onUpdateDecksAndSelection,
    onClickPlaceholder,
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

    const ListOfDecks = () => (
        <List>
            {decks.map((deck, index) => (
                <ListItem key={index} disablePadding>
                    <ListItemButton
                        selected={selectedIndex === index}
                        onClick={() => onUpdateDecksAndSelection(index)}
                        sx={{ paddingLeft: '14px', paddingRight: '10px' }}
                    >
                        <ListItemText
                            primary={deck.name}
                            primaryTypographyProps={{ fontSize: '0.8rem' }}
                        />
                        <IconButton
                            aria-label='open deck in moxfield'
                            edge='end'
                            onClick={(e) => fireDeckEdit(e, deck)}
                            sx={{ borderRadius: '4px' }}
                            size='small'
                        >
                            <OpenInNew />
                        </IconButton>
                        <IconButton
                            aria-label='remove deck'
                            edge='end'
                            onClick={(e) => fireDeckRemove(e, index)}
                            sx={{ borderRadius: '4px', color: 'var(--nord11)' }}
                            size='small'
                        >
                            <Remove />
                        </IconButton>
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
                        <h6>Import a deck to get started</h6>
                    </div>
                </div>
            )}
        </Box>
    );
};
