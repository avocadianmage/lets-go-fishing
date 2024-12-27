import { Add, Close, OpenInNew } from '@mui/icons-material';
import { List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { DatabaseService, DeckInfo } from '../../services/dbSvc';
import { InputButton } from '../controls/inputButton';
import { CardHeaderTypographyProps } from '../../global/constants';
import { DeckEditModal } from './deckEditModal';

interface DeckSelectProps {
    isDeckEditModalOpen: boolean;
    decks: DeckInfo[];
    selectedIndex: number;
    onUpdateDecksAndSelection(index: number, updatedDeckInfos?: DeckInfo[]): void;
    onDeckEditModalStateChange(open: boolean, updatedDeck?: DeckInfo): void;
}

export const DeckSelect = ({
    isDeckEditModalOpen,
    decks,
    selectedIndex,
    onUpdateDecksAndSelection,
    onDeckEditModalStateChange,
}: DeckSelectProps) => {
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

    const DeckImport = (
        <ListItem sx={{ p: '4px', pl: '16px' }}>
            <ListItemText primaryTypographyProps={CardHeaderTypographyProps} primary='My Decks' />
            <InputButton
                tooltip='Import deck'
                onClick={() => onDeckEditModalStateChange(true)}
                sx={{ color: 'var(--nord14)' }}
            >
                <Add />
            </InputButton>
        </ListItem>
    );

    return (
        <>
            <List
                sx={{ p: 0, maxHeight: 'calc(36px * 8)', overflowY: 'auto' }}
                subheader={DeckImport}
            >
                {decks.map((deck, index) => {
                    const isSelected = selectedIndex === index;
                    const url = decks[index].url;
                    return (
                        <ListItemButton
                            key={index}
                            selected={isSelected}
                            disableRipple
                            sx={{ paddingRight: '12px' }}
                            onClick={() => onUpdateDecksAndSelection(index)}
                        >
                            <ListItemText
                                primaryTypographyProps={{ fontSize: '0.8rem', noWrap: true }}
                                primary={deck.name}
                                sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                            />

                            {/* TODO: add edit functionality */}

                            {url && (
                                <InputButton
                                    tooltip='Open link'
                                    sx={{ p: '2px' }}
                                    link={url}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <OpenInNew sx={{ fontSize: 20 }} />
                                </InputButton>
                            )}

                            <InputButton
                                tooltip='Remove'
                                sx={{ p: '2px', color: 'var(--nord15)' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeDeck(index);
                                }}
                            >
                                <Close sx={{ fontSize: 20 }} />
                            </InputButton>
                        </ListItemButton>
                    );
                })}
            </List>
            <DeckEditModal
                isOpen={isDeckEditModalOpen}
                onClose={(deck?: DeckInfo) => onDeckEditModalStateChange(false, deck)}
            />
        </>
    );
};
