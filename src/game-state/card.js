import React from 'react';
import { CardInfoService } from '../services/cardInfoSvc';

import './card.css';
import cardBack from '../assets/mtg-card-back.png';

export default class Card extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            imageUrl: null,
            error: null,
        };
    }

    componentDidMount() {
        CardInfoService.setCardImage(this.props.name, this);
    }

    render() {
        const { imageUrl, error } = this.state;
        const loading = !imageUrl && !error && !this.props.faceDown;
        const imageUrlToUse = (loading || this.props.faceDown) ? 
            cardBack : imageUrl;

        return (
            <div
                className={"card " + (loading ? "loading" : "")}
                style={{ backgroundImage: `url(${imageUrlToUse})` }}
            >
                { loading ? <div className="loader" /> : null}
            </div>
        );
    }
}
