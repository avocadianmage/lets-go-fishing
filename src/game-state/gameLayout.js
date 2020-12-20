import React from 'react';
import Hand from './hand';
import { Library } from './library';
import { Battlefield } from './battlefield';
import DeckLookup from '../other-components/deckLookup';
import { DeckInfoService } from '../services/deckInfoSvc';
import { DatabaseService } from '../services/dbSvc';
import { shuffle } from '../utilities/shuffle';

import * as Constants from '../utilities/constants';

export default class GameLayout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            libraryContents: [],
            handContents: [],
        };
    }

    async componentDidMount() {
        this.startGame(await DatabaseService.getDeck());
    }

    importDeck(deckUrl) {
        this.showLoadingState();
        DeckInfoService.getDecklist(deckUrl)
            .then(decklist => this.startGame(decklist));
    }

    startGame(decklist) {
        if (!decklist) return;
        this.shuffleDeck(decklist);
        this.draw(Constants.STARTING_HAND_SIZE);
    }

    shuffleDeck(decklist) {
        this.setState({
            loading: false,
            libraryContents: shuffle(decklist)
        });
    }

    draw(num = 1) {
        const { loading, libraryContents, handContents } = this.state;
        if (loading) return;
        this.setState({
            handContents: handContents.concat(libraryContents.slice(0, num)),
            libraryContents: libraryContents.slice(num),
        });
    }

    showLoadingState() {
        this.setState({ loading: true });
    }

    getTopCard() {
        const { libraryContents } = this.state;
        return libraryContents ? libraryContents[0] : null;
    }

    render() {
        const { loading, handContents } = this.state;
        return (
            <div>
                <div className="topPanel">
                    <DeckLookup
                        onImportClick={deckUrl => this.importDeck(deckUrl)}
                    />
                </div>
                <div className="gameLayout">
                    <Battlefield />
                    <div className="bottomPanel">
                        <Hand contents={handContents} />
                        <Library
                            loading={loading}
                            topCard={this.getTopCard()}
                            onClick={() => this.draw()}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
