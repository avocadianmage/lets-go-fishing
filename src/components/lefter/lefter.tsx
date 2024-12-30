import { Coffee, Favorite, GitHub } from '@mui/icons-material';
import { Box, Card, Divider, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { STARTING_LIFE } from '../../global/constants';
import { DatabaseService, DeckInfo } from '../../services/dbSvc';
import { GameDetailsState, ManaColor } from '../gameLayout/gameLayout';
import { DeckSelect } from './deckSelect';
import { NumberWheel } from './numberWheel';

import SvgManaBlack from '../../assets/mana-black.svg';
import SvgManaBlue from '../../assets/mana-blue.svg';
import SvgManaColorless from '../../assets/mana-colorless.svg';
import SvgManaGreen from '../../assets/mana-green.svg';
import SvgManaRed from '../../assets/mana-red.svg';
import SvgManaWhite from '../../assets/mana-white.svg';
import { Shortcuts } from './shortcuts';
import { InputButton } from '../controls/inputButton';

import { repository, funding } from '../../../package.json';
import { Pane } from '../controls/pane';
import { LefterCardHeader } from '../controls/lefterCardHeader';

interface LefterProps {
    isDeckEditModalOpen: boolean;
    gameDetailsState: GameDetailsState;
    onUpdateGameDetailsState(state: GameDetailsState): void;
    onDeckSelect(deckInfo?: DeckInfo): void;
    onDeckEditModalStateChange(open: boolean, updatedDeck?: DeckInfo): void;
}

export const Lefter = ({
    isDeckEditModalOpen,
    gameDetailsState,
    onUpdateGameDetailsState,
    onDeckSelect,
    onDeckEditModalStateChange,
}: LefterProps) => {
    const handleDeckEditModalStateChange = (open: boolean, updatedDeck?: DeckInfo) => {
        onDeckEditModalStateChange(open);
        if (updatedDeck && !open) addDeck(updatedDeck);
    };

    const SvgManaMap = {
        [ManaColor.White]: SvgManaWhite,
        [ManaColor.Blue]: SvgManaBlue,
        [ManaColor.Black]: SvgManaBlack,
        [ManaColor.Red]: SvgManaRed,
        [ManaColor.Green]: SvgManaGreen,
        [ManaColor.Colorless]: SvgManaColorless,
    };

    const ManaNumberWheel = ({ color }: { color: ManaColor }) => {
        const label = color + ' mana';
        return (
            <NumberWheel
                label={label}
                icon={<img src={SvgManaMap[color]} alt={label} />}
                count={gameDetailsState[color]}
                updateCount={(manaValue) =>
                    onUpdateGameDetailsState({ ...gameDetailsState, [color]: manaValue })
                }
                min={0}
            />
        );
    };

    const [decks, setDecks] = useState<DeckInfo[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const updateDecksAndSelection = (index: number, updatedDecks?: DeckInfo[]) => {
        const anyUpdates = !!updatedDecks;
        updatedDecks = updatedDecks ?? decks;
        const selectedDeck = updatedDecks.length === 0 ? undefined : updatedDecks[index];

        DatabaseService.PutSelectedDeckKey(selectedDeck?.key ?? '');
        setDecks(updatedDecks);

        if (index === selectedIndex && !anyUpdates) return;
        setSelectedIndex(index);
        onDeckSelect(selectedDeck);
    };

    enum SelectDeckFlags {
        None,
        SelectAddedDeck,
        SelectEditedDeckByKey,
    }

    const fetchDecks = async (selectDeckFlags: SelectDeckFlags, key?: string) => {
        const decks = await DatabaseService.GetDecks();

        let indexToSelect;
        if (selectDeckFlags === SelectDeckFlags.SelectAddedDeck) {
            indexToSelect = decks.length - 1;
        } else {
            const deckKeyToSelect = key ?? DatabaseService.GetSelectedDeckKey();
            indexToSelect = Math.max(
                0,
                decks.findIndex((di) => di.key?.toString() === deckKeyToSelect!.toString())
            );
        }

        updateDecksAndSelection(indexToSelect, decks);
    };

    const addDeck = async (deckInfo: DeckInfo) => {
        await DatabaseService.PutDeck(deckInfo);
        fetchDecks(
            deckInfo.key === undefined
                ? SelectDeckFlags.SelectAddedDeck
                : SelectDeckFlags.SelectEditedDeckByKey,
            deckInfo.key
        );
    };

    useEffect(() => {
        fetchDecks(SelectDeckFlags.None);
    }, []);

    return (
        <Pane id='lefter'>
            <Box sx={{ p: '10px' }}>
                <Box sx={{ float: 'right' }}>
                    <InputButton tooltip='GitHub' link={repository.url}>
                        <GitHub />
                    </InputButton>
                    <InputButton tooltip='Buy me a coffee' link={funding}>
                        <Coffee />
                    </InputButton>
                </Box>
                <Typography
                    variant='h5'
                    textTransform='uppercase'
                    sx={{ userSelect: 'none', marginBottom: '16px', color: 'var(--nord13)' }}
                >
                    Let's Go Fishing
                </Typography>

                <Card sx={{ marginBottom: '16px' }}>
                    <DeckSelect
                        isDeckEditModalOpen={isDeckEditModalOpen}
                        decks={decks}
                        selectedIndex={selectedIndex}
                        onUpdateDecksAndSelection={updateDecksAndSelection}
                        onDeckEditModalStateChange={handleDeckEditModalStateChange}
                    />
                </Card>

                {decks.length > 0 && (
                    <>
                        <Card sx={{ marginBottom: '16px' }}>
                            <LefterCardHeader title='Life and floating mana' />
                            <Box sx={{ display: 'flex' }}>
                                <NumberWheel
                                    label='life'
                                    icon={<Favorite sx={{ color: 'var(--nord15)' }} />}
                                    count={gameDetailsState.life}
                                    updateCount={(life) =>
                                        onUpdateGameDetailsState({ ...gameDetailsState, life })
                                    }
                                    defaultCount={STARTING_LIFE}
                                />

                                <Divider orientation='vertical' variant='middle' flexItem />

                                {(Object.keys(ManaColor) as Array<keyof typeof ManaColor>).map(
                                    (color) => (
                                        <ManaNumberWheel key={color} color={ManaColor[color]} />
                                    )
                                )}
                            </Box>
                        </Card>

                        <Shortcuts />
                    </>
                )}
            </Box>
        </Pane>
    );
};
