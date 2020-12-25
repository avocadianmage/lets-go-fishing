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
    dragSourceZone?: string;
    dragTargetZone?: string;
}

export default class GameLayout extends Component<{}, GameLayoutState> {
    state: GameLayoutState = {
        loading: false,
        zones: {
            [Zone.Library]: [],
            [Zone.Hand]: [],
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

    onDragCardStart(cardInfo: CardInfo, cardElem: HTMLElement) {
        this.setState({ 
            draggingCard: cardInfo,
            dragSourceZone: cardElem.parentElement?.id,
        });
        return true;
    }

    onDragCardStop(cardInfo: CardInfo, cardElem: HTMLElement) {
        const { dragSourceZone, dragTargetZone } = this.state;
        
        this.setState({ 
            draggingCard: undefined, 
            dragSourceZone: undefined,
            dragTargetZone: undefined
        });

        if (!dragTargetZone || dragSourceZone === dragTargetZone) return false;

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
                        isDraggedOver={dragTargetZone === Zone.Battlefield} 
                    />
                    <div className="bottomPanel">
                        <Hand 
                            contents={zones[Zone.Hand]} 
                            onCardDragStart={
                                (info, elem) => this.onDragCardStart(info, elem)
                            }
                            onCardDragStop={
                                (info, elem) => this.onDragCardStop(info, elem)
                            }
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
