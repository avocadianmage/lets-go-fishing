import React from 'react';
import '../App.css';
import './card.css';
import Card from './card';

export default class Library extends React.Component {
    render() {
        const { topCard } = this.props;
        return (
            <div className="library gutter cardDimensions">
                {topCard ? <Card {...topCard} /> : null}
            </div>
        );
    }
}
