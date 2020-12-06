import React from 'react';
import DecklistLookup from '../other-components/decklistLookup';
import Hand from './hand';
import Library from './library';

import './gameLayout.css';

export default class GameLayout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            libraryTopCard: null,
        };
    }

    loadDeck(deckUrl) {
        // Show loading state.
        this.setTopCard(null);
    }

    setTopCard(name) {
        this.setState({ libraryTopCard: { name, faceDown: true } });
    }

    render() {
        return (
            <div className="gameLayout">
                <div className="topPanel">
                    <DecklistLookup
                        onImportClick={(deckUrl) => this.loadDeck(deckUrl)}
                    />
                </div>
                <div className="bottomPanel">
                    <Hand />
                    <Library topCard={this.state.libraryTopCard} />
                </div>
            </div>
        );
    }
}
