import { Coffee, Favorite, GitHub } from '@mui/icons-material';
import { Box, Card, CardHeader, Divider, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { STARTING_LIFE } from '../../global/constants';
import { DatabaseService, DeckInfo } from '../../services/dbSvc';
import { GameDetailsState, ManaColor, Pane } from '../gameLayout/gameLayout';
import { DeckImport } from './deckImport';
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

interface LefterProps {
    gameDetailsState: GameDetailsState;
    onUpdateGameDetailsState(state: GameDetailsState): void;
    onDeckSelect(deckInfo?: DeckInfo): void;
}

export const Lefter = ({
    gameDetailsState,
    onUpdateGameDetailsState,
    onDeckSelect,
}: LefterProps) => {
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
        DatabaseService.putSelectedDeckName(selectedDeck?.name ?? '');
        setDecks(updatedDecks);

        if (index === selectedIndex && !anyUpdates) return;
        setSelectedIndex(index);
        onDeckSelect(selectedDeck);
    };

    const addDeck = (deckInfo: DeckInfo) => {
        const existingDeckIndex = decks.findIndex((d) => d.url === deckInfo.url);
        if (existingDeckIndex >= 0) {
            updateDecksAndSelection(existingDeckIndex);
        } else {
            updateDecksAndSelection(decks.length, decks.concat(deckInfo));
        }
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
                    <DeckImport decks={decks} onImport={addDeck} />
                    {decks.length > 0 && <Divider />}
                    <DeckSelect
                        decks={decks}
                        selectedIndex={selectedIndex}
                        onUpdateDecksAndSelection={updateDecksAndSelection}
                    />
                </Card>

                <Card sx={{ marginBottom: '16px' }}>
                    <Box sx={{ m: '0 14px' }}>
                        <CardHeader
                            title={decks[selectedIndex]?.name}
                            titleTypographyProps={{ variant: 'overline' }}
                            sx={{ p: '6px 0 4px 0' }}
                        />
                        <Divider />
                    </Box>

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

                        {(Object.keys(ManaColor) as Array<keyof typeof ManaColor>).map((color) => (
                            <ManaNumberWheel key={color} color={ManaColor[color]} />
                        ))}
                    </Box>
                </Card>

                <Shortcuts />
            </Box>
        </Pane>
    );
};
