import React, { Component } from 'react';
import Hand from './hand';
import { Library } from './library';
import { Battlefield } from './battlefield';
import DeckLookup from '../other-components/deckLookup';
import { DeckInfoService } from '../services/deckInfoSvc';
import { CardInfo, DatabaseService } from '../services/dbSvc';
import * as Constants from '../utilities/constants';
import { shuffle } from '../utilities/helpers';

export const Zone = {
    Library: 'library',
    Hand: 'hand',
    Battlefield: 'battlefield',
};

interface GameLayoutState {
    loading: boolean;
    zones: { [domId: string]: CardInfo[] };
    draggingCard?: CardInfo;
    dragTargetZone?: string;
}

export default class GameLayout extends Component<{}, GameLayoutState> {
    state: GameLayoutState = {
        loading: false,
        zones: {
            [Zone.Library]: [],
            [Zone.Hand]: [],
            [Zone.Battlefield]: [],
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
            zones: { ...this.state.zones, [Zone.Library]: shuffle(decklist) },
        });
    }

    draw(num = 1) {
        const { loading, zones } = this.state;
        if (loading) return;
        const handCards = zones[Zone.Hand];
        const libraryCards = zones[Zone.Library];
        this.setState({
            zones: {
                ...zones,
                [Zone.Hand]: handCards.concat(libraryCards.slice(0, num)),
                [Zone.Library]: libraryCards.slice(num),
            },
        });
    }

    showLoadingState() {
        this.setState({ loading: true });
    }

    getTopCard() {
        const libraryCards = this.state.zones[Zone.Library];
        return libraryCards ? libraryCards[0] : undefined;
    }

    sliceCardFromZone(card: CardInfo, zone: string) {
        const sourceCards = this.state.zones[zone];
        const sourceCardIndex = sourceCards.findIndex(c => c.id === card.id);
        return sourceCards
            .slice(0, sourceCardIndex)
            .concat(sourceCards.slice(sourceCardIndex + 1));
    }

    onDragCardStart = (card: CardInfo) => {
        this.setState({ draggingCard: card });
        return true;
    }

    onDragCardStop = (card: CardInfo, sourceZone?: string) => {
        const { dragTargetZone, zones } = this.state;
        this.setState({ 
            draggingCard: undefined, 
            dragTargetZone: undefined
        });

        if (!sourceZone || !dragTargetZone || sourceZone === dragTargetZone) {
            return false;
        }

        this.setState({
            zones: {
                ...zones,
                [sourceZone]: this.sliceCardFromZone(
                    card, sourceZone
                ),
                [dragTargetZone]: zones[dragTargetZone].concat(card),
            }
        });
        return true;
    }

    onMouseMove(e: React.MouseEvent) {
        if (!this.state.draggingCard) return;
        const mouseOverElems = document.elementsFromPoint(e.clientX, e.clientY);
        const targetElem = mouseOverElems.find(
            elem => elem.classList.contains('zone')
        );
        this.setState({ dragTargetZone: targetElem?.id });
    }

    render() {
        const { loading, zones, dragTargetZone } = this.state;
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
                        contents={zones[Zone.Battlefield]}
                        isDraggedOver={dragTargetZone === Zone.Battlefield} 
                    />
                    <div className="bottomPanel">
                        <Hand 
                            contents={zones[Zone.Hand]} 
                            onCardDragStart={this.onDragCardStart}
                            onCardDragStop={this.onDragCardStop}
                        />
                        <Library
                            loading={loading}
                            topCard={this.getTopCard()}
                            onClick={() => this.draw()}
                        />
                    </div>
                </div>
            </>
        );
    }
}
