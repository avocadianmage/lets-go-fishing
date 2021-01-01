import React, { Component } from 'react';
import { Hand } from './hand';
import { Library } from './library';
import { Battlefield } from './battlefield';
import DeckLookup from '../other-components/deckLookup';
import { DeckInfoService } from '../services/deckInfoSvc';
import { CardInfo, DatabaseService } from '../services/dbSvc';
import * as Constants from '../utilities/constants';
import { shuffle } from '../utilities/helpers';
import { DragInfo } from './card';

export const ZoneName = {
    None: 'none',
    Library: 'library',
    Hand: 'hand',
    Battlefield: 'battlefield',
};

interface GameLayoutState {
    loading: boolean;
    zones: { [domId: string]: CardInfo[] };
    drag?: DragInfo;
}

export default class GameLayout extends Component<{}, GameLayoutState> {
    state: GameLayoutState = {
        loading: false,
        zones: {
            [ZoneName.Library]: [],
            [ZoneName.Hand]: [],
            [ZoneName.Battlefield]: [],
        },
    }

    async componentDidMount() {
        const decklist = await DatabaseService.getDeck();
        if (decklist) this.startGame(decklist);
    }

    importDeck(deckUrl: string) {
        this.showLoadingState();
        DeckInfoService.getDecklist(deckUrl)
            .then(decklist => this.startGame(decklist));
    }

    startGame(decklist: CardInfo[]) {
        this.shuffleDeck(decklist);
        this.draw(Constants.STARTING_HAND_SIZE);
    }

    shuffleDeck(decklist: CardInfo[]) {
        this.setState({
            loading: false,
            zones: { ...this.state.zones, [ZoneName.Library]: shuffle(decklist) },
        });
    }

    draw(num = 1) {
        const { loading, zones } = this.state;
        if (loading) return;
        const handCards = zones[ZoneName.Hand];
        const libraryCards = zones[ZoneName.Library];
        const cutIndex = libraryCards.length - num;
        this.setState({
            zones: {
                ...zones,
                [ZoneName.Hand]: handCards.concat(libraryCards.slice(cutIndex)),
                [ZoneName.Library]: libraryCards.slice(0, cutIndex),
            },
        });
    }

    showLoadingState() {
        this.setState({ loading: true });
    }

    sliceCardFromZone(card: CardInfo, zone: string) {
        const sourceCards = this.state.zones[zone];
        const sourceCardIndex = sourceCards.findIndex(c => c.id === card.id);
        return sourceCards
            .slice(0, sourceCardIndex)
            .concat(sourceCards.slice(sourceCardIndex + 1));
    }

    onDragCardStart = (drag: DragInfo) => {
        this.setState({ drag });
        return true;
    }

    onDragCardStop = () => {
        const { zones } = this.state;
        const { card, sourceZone, targetZone } = this.state.drag!;
        this.setState({ drag: undefined });

        if (!sourceZone || targetZone === ZoneName.None) return false;
        // If the card was clicked without dragging or the card was not dragged 
        // away from the zone:
        if (!targetZone || sourceZone === targetZone) {
            if (sourceZone !== ZoneName.Library) return false;
            this.draw();
            return true;
        }

        this.setState({
            zones: {
                ...zones,
                [sourceZone]: this.sliceCardFromZone(card, sourceZone),
                [targetZone]: zones[targetZone].concat(card),
            }
        });
        return true;
    }

    onMouseMove(e: React.MouseEvent) {
        const { drag } = this.state;
        if (!drag) return;
        const mouseOverElems = document.elementsFromPoint(e.clientX, e.clientY);
        const targetElem = mouseOverElems.find(
            elem => elem.classList.contains('zone')
        );
        this.setState({ drag: { 
            ...drag,
            targetZone: targetElem ? targetElem.id : ZoneName.None,
        } });
    }

    render() {
        const { zones, drag } = this.state;
        const zoneProps = { 
            drag, 
            onCardDragStart: this.onDragCardStart,
            onCardDragStop: this.onDragCardStop,
        };
        return (
            <>
                <div className="topPanel">
                    <DeckLookup
                        onImportClick={deckUrl => this.importDeck(deckUrl)}
                    />
                </div>
                <div 
                    className="gameLayout" 
                    onMouseMove={e => this.onMouseMove(e)}
                >
                    <Battlefield 
                        {...zoneProps}
                        contents={zones[ZoneName.Battlefield]}
                    />
                    <div className="bottomPanel">
                        <Hand 
                            {...zoneProps}
                            contents={zones[ZoneName.Hand]} 
                        />
                        <Library 
                            {...zoneProps}
                            contents={zones[ZoneName.Library]} 
                        />
                    </div>
                </div>
            </>
        );
    }
}
