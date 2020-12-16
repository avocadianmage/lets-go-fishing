import React from 'react';
import Card from './card';

export default class Library extends React.Component {
    renderTopCard() {
        const { loading, topCard, onClick } = this.props;
        return loading || topCard ?
            <Card info={topCard} faceDown={true} onClick={onClick} /> :
            null;
    }

    render() {
        return (
            <div className="library gutter">
                {this.renderTopCard()}
            </div>
        );
    }
}
