import React from 'react';
import Hand from './hand';
import { Library } from './library';
import { Battlefield } from './battlefield';
import DeckLookup from '../other-components/deckLookup';
import { DeckInfoService } from '../services/deckInfoSvc';
import { DatabaseService, ICard } from '../services/dbSvc';
import { shuffle } from '../utilities/shuffle';

import * as Constants from '../utilities/constants';

export interface IGameLayoutProps {

}

export interface IGameLayoutState {
    loading: boolean;
    libraryContents: any[];
    handContents: any[];
}

export default class GameLayout extends React.Component<IGameLayoutProps, IGameLayoutState> {
    constructor(props: IGameLayoutProps) {
        super(props);
        this.state = {
            loading: false,
            libraryContents: [],
            handContents: [],
        };
    }

    async componentDidMount(): Promise<void> {
        this.startGame(await DatabaseService.getDeck());
    }

    importDeck(deckUrl: string): void {
        this.showLoadingState();
        DeckInfoService.getDecklist(deckUrl)
            .then(decklist => this.startGame(decklist));
    }

    startGame(decklist: ICard[] | undefined): void {
        if (!decklist) return;
        this.shuffleDeck(decklist);
        this.draw(Constants.STARTING_HAND_SIZE);
    }

    shuffleDeck(decklist: ICard[]): void {
        this.setState({
            loading: false,
            libraryContents: shuffle(decklist)
        });
    }

    draw(num = 1): void {
        const { loading, libraryContents, handContents } = this.state;
        if (loading) return;
        this.setState({
            handContents: handContents.concat(libraryContents.slice(0, num)),
            libraryContents: libraryContents.slice(num),
        });
    }

    showLoadingState(): void {
        this.setState({ loading: true });
    }

    getTopCard(): any | null {
        const { libraryContents } = this.state;
        return libraryContents ? libraryContents[0] : null;
    }

    render(): JSX.Element {
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
