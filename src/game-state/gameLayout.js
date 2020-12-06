import React from 'react';
import DeckLookup from '../other-components/deckLookup';
import Hand from './hand';
import Library from './library';
import { DeckInfoService } from '../services/deckInfoSvc';

import './gameLayout.css';

export default class GameLayout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            libraryContents: null,
        };
    }

    loadDeck(deckUrl) {
        this.showLoadingState();
        DeckInfoService.getDecklist(deckUrl)
            .then(decklist => {
                this.setState({ 
                    libraryContents: decklist
                });
            });
    }

    showLoadingState() {
        this.setState({ libraryContents: [ null ] });
    }

    getTopCard() {
        return this.state.libraryContents ? 
            { name: this.state.libraryContents[0], faceDown: true } :
            null;
    }

    render() {
        return (
            <div className="gameLayout">
                <div className="topPanel">
                    <DeckLookup
                        onImportClick={(deckUrl) => this.loadDeck(deckUrl)}
                    />
                </div>
                <div className="bottomPanel">
                    <Hand />
                    <Library topCard={this.getTopCard()} />
                </div>
            </div>
        );
    }
}
