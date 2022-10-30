import { useEffect, useState } from 'react';
import { DatabaseService, DeckInfo } from '../../services/dbSvc';
import { DeckImport } from './deckImport';
import {
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Paper,
} from '@mui/material';
import { OpenInNew, Remove } from '@mui/icons-material';

interface LefterProps {
    onDeckSelect(deckInfo?: DeckInfo): void;
}

export const Lefter = ({ onDeckSelect }: LefterProps) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [deckInfos, setDeckInfos] = useState<DeckInfo[]>([]);

    const updateDecksAndSelection = (index: number, updatedDeckInfos?: DeckInfo[]) => {
        const decks = updatedDeckInfos ?? deckInfos;
        const selectedDeck = decks.length === 0 ? undefined : decks[index];
        DatabaseService.putSelectedDeckName(selectedDeck?.name ?? '');
        setDeckInfos(decks);
        setSelectedIndex(index);
        onDeckSelect(selectedDeck);
    };

    const fireDeckRemove = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, index: number) => {
        e.stopPropagation();

        const deckToRemove = deckInfos[index].name;
        DatabaseService.deleteDeck(deckToRemove);

        const updatedDeckInfos = deckInfos.filter((di: DeckInfo) => di.name !== deckToRemove);
        let selectedIndex = deckInfos.findIndex((di: DeckInfo) => di.name === deckToRemove);
        selectedIndex =
            selectedIndex <= updatedDeckInfos.length - 1 ? selectedIndex : selectedIndex - 1;
        updateDecksAndSelection(selectedIndex, updatedDeckInfos);
    };

    const fireDeckEdit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, index: number) => {
        e.stopPropagation();
        window.open(deckInfos[index].url, '_blank');
    };

    const doImport = (deckInfo: DeckInfo) => {
        updateDecksAndSelection(deckInfos.length, deckInfos.concat(deckInfo));
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
        <div id='lefter' className='pane'>
            <h1>Let's Go Fishing</h1>

            <Paper>
                <DeckImport onImport={doImport} />
                <Divider />
                <List sx={{ height: 250, maxHeight: 250, overflow: 'auto' }}>
                    {deckInfos.map((di, index) => (
                        <ListItem key={index} disablePadding onFocus={(e) => e.target.blur()}>
                            <ListItemButton
                                selected={selectedIndex === index}
                                onClick={() => updateDecksAndSelection(index)}
                                sx={{ '&:hover': { '& svg': { opacity: 1 } } }}
                            >
                                <ListItemText primary={di.name} />
                                <IconButton
                                    aria-label='open deck in moxfield'
                                    edge='end'
                                    onClick={(e) => fireDeckEdit(e, index)}
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
            </Paper>
        </div>
    );
};
