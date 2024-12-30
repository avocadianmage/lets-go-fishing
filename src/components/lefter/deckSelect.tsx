import { Add, Close, Edit, Public, SvgIconComponent } from '@mui/icons-material';
import { List, ListItemButton, ListItemText, ListSubheader, Typography } from '@mui/material';
import { DatabaseService, DeckInfo } from '../../services/dbSvc';
import { InputButton } from '../controls/inputButton';
import { CardHeaderTypographyProps } from '../../global/constants';
import { DeckEditModal } from './deckEditModal';
import { useState } from 'react';

interface DeckSelectProps {
    isDeckEditModalOpen: boolean;
    decks: DeckInfo[];
    selectedIndex: number;
    onUpdateDecksAndSelection(index: number, updatedDeckInfos?: DeckInfo[]): void;
    onDeckEditModalStateChange(open: boolean, deck?: DeckInfo): void;
}

export const DeckSelect = ({
    isDeckEditModalOpen,
    decks,
    selectedIndex,
    onUpdateDecksAndSelection,
    onDeckEditModalStateChange,
}: DeckSelectProps) => {
    const [deckToEdit, setDeckToEdit] = useState<DeckInfo | undefined>(undefined);

    const handleDeckEditModalStateChange = (open: boolean, deck?: DeckInfo) => {
        setDeckToEdit(deck);
        onDeckEditModalStateChange(open, deck);
    };

    const removeDeck = (index: number) => {
        const deckToRemove = decks[index];
        DatabaseService.DeleteDeck(deckToRemove);

        const updatedDeckInfos = decks.filter((di: DeckInfo) => di.key !== deckToRemove.key);

        let newSelectedIndex = selectedIndex;
        if (index <= selectedIndex) {
            newSelectedIndex = selectedIndex - 1;
            if (newSelectedIndex === -1 && updatedDeckInfos.length > 0) newSelectedIndex = 0;
        }

        onUpdateDecksAndSelection(newSelectedIndex, updatedDeckInfos);
    };

    const DeckImport = (
        <ListSubheader
            sx={{
                pr: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}
        >
            <Typography {...CardHeaderTypographyProps}>My Decks</Typography>
            <InputButton
                tooltip='Import deck'
                onClick={() => handleDeckEditModalStateChange(true)}
                sx={{ color: 'var(--nord14)', mt: '-4px' }}
            >
                <Add />
            </InputButton>
        </ListSubheader>
    );

    const DeckButton = (
        Icon: SvgIconComponent,
        tooltip: string,
        url?: string,
        clickAction?: () => void
    ) => {
        return (
            <InputButton
                tooltip={tooltip}
                sx={{ p: '2px' }}
                link={url}
                onClick={(e) => {
                    e.stopPropagation();
                    clickAction && clickAction();
                }}
            >
                <Icon sx={{ fontSize: 20 }} />
            </InputButton>
        );
    };

    return (
        <>
            <List sx={{ p: 0, maxHeight: '400px', overflowY: 'auto' }} subheader={DeckImport}>
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

                            {url && DeckButton(Public, 'Open Link', url)}
                            {DeckButton(Edit, 'Edit', undefined, () =>
                                handleDeckEditModalStateChange(true, deck)
                            )}
                            {DeckButton(Close, 'Remove', undefined, () => removeDeck(index))}
                        </ListItemButton>
                    );
                })}
            </List>
            <DeckEditModal
                isOpen={isDeckEditModalOpen}
                deckToEdit={deckToEdit}
                onClose={(deck?: DeckInfo) => handleDeckEditModalStateChange(false, deck)}
            />
        </>
    );
};
