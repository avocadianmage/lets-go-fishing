import { Component } from 'react';
import Hand from './hand';
import { Library } from './library';
import { Battlefield } from './battlefield';
import DeckLookup from '../other-components/deckLookup';
import { DeckInfoService } from '../services/deckInfoSvc';
import { CardInfo, DatabaseService } from '../services/dbSvc';
import * as Constants from '../utilities/constants';
import { shuffle } from '../utilities/helpers';

interface GameLayoutState {
    loading: boolean;
    libraryContents: CardInfo[];
    handContents: CardInfo[];
}

export default class GameLayout extends Component<{}, GameLayoutState> {
    state: GameLayoutState = {
        loading: false,
        libraryContents: [],
        handContents: [],
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
        return libraryContents ? libraryContents[0] : undefined;
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
