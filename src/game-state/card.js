import React from 'react';
import CardInfoSvc from '../services/cardInfoSvc';

import './card.css';
import cardBack from '../assets/mtg-card-back.png';

export default class Card extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            imageUri: cardBack,
            error: null,
        };
    }

    componentDidMount() {
        new CardInfoSvc().setCardImage(this.props.name, this);
    }

    render() {
        const { imageUri, error } = this.state;
        const loading = imageUri === cardBack && error === null;

        return (
            <div
                className={"card " + (loading ? "loading" : "")}
                style={{ backgroundImage: `url(${imageUri})` }}
            >
                { loading ? <div className="loader" /> : null}
            </div>
        );
    }
}
