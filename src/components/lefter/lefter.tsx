import { Favorite, GitHub } from '@mui/icons-material';
import { Box, Divider, Link, Paper } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
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
import { InputButton } from './inputButton';

import { repository } from '../../../package.json';

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

    const deckImportRef = useRef<HTMLInputElement>(null);

    const [decks, setDecks] = useState<DeckInfo[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const updateDecksAndSelection = (index: number, updatedDecks?: DeckInfo[]) => {
        updatedDecks = updatedDecks ?? decks;
        const selectedDeck = updatedDecks.length === 0 ? undefined : updatedDecks[index];
        DatabaseService.putSelectedDeckName(selectedDeck?.name ?? '');
        setDecks(updatedDecks);
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
                    <Link href={repository.url}>
                        <InputButton aria-label='GitHub'>
                            <GitHub />
                        </InputButton>
                    </Link>
                </Box>
                <h1 style={{ marginTop: 0 }}>Let's Go Fishing</h1>

                <Paper sx={{ marginBottom: '16px' }}>
                    <DeckImport ref={deckImportRef} decks={decks} onImport={addDeck} />
                    <Divider />
                    <DeckSelect
                        decks={decks}
                        selectedIndex={selectedIndex}
                        onUpdateDecksAndSelection={updateDecksAndSelection}
                        onClickPlaceholder={() => deckImportRef.current?.focus()}
                    />
                </Paper>

                <Paper sx={{ marginBottom: '16px', display: 'flex' }}>
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
                </Paper>

                <Shortcuts />
            </Box>
        </Pane>
    );
};
