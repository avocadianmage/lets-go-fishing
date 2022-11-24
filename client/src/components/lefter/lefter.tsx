import React, { useEffect, useRef, useState } from 'react';
import { DatabaseService, DeckInfo } from '../../services/dbSvc';
import { DeckImport } from './deckImport';
import { CardContent, Divider, Paper } from '@mui/material';
import { DeckSelect } from './deckSelect';
import { GameDetailsState, ManaColor, Pane } from '../gameLayout/gameLayout';
import { NumberWheel } from './numberWheel';
import { Favorite } from '@mui/icons-material';
import { STARTING_LIFE } from '../../utilities/constants';

import SvgManaWhite from '../../assets/mana-white.svg';
import SvgManaBlue from '../../assets/mana-blue.svg';
import SvgManaBlack from '../../assets/mana-black.svg';
import SvgManaRed from '../../assets/mana-red.svg';
import SvgManaGreen from '../../assets/mana-green.svg';
import SvgManaColorless from '../../assets/mana-colorless.svg';

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
        updateDecksAndSelection(decks.length, decks.concat(deckInfo));
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
            <CardContent>
                <h1 style={{ margin: 6, marginBottom: 16 }}>Let's Go Fishing</h1>

                <Paper className='widget'>
                    <DeckImport ref={deckImportRef} onImport={addDeck} />
                    <Divider />
                    <DeckSelect
                        decks={decks}
                        selectedIndex={selectedIndex}
                        onUpdateDecksAndSelection={updateDecksAndSelection}
                        onClickPlaceholder={() => deckImportRef.current?.focus()}
                    />
                </Paper>

                <Paper className='widget' sx={{ display: 'flex' }}>
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
            </CardContent>
        </Pane>
    );
};
