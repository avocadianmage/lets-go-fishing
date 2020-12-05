import React from 'react';
import Hand from './hand';
import Library from './library';

import './gameLayout.css';

export default class GameLayout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            topCard: null,
        };
    }

    render() {
        return (
            <div className="gameLayout">
                <div className="bottomPanel">
                    <Hand />
                    <Library topCard={this.state.topCard} />
                </div>
            </div>
        );
    }
}
