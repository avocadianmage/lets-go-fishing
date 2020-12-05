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
        const { name } = this.props;
        if (!name) return;
        CardInfoService.getCardImageBlob(name)
            .then(blob => this.setState({ 
                imageUrl: URL.createObjectURL(blob) 
            }));
    }

    render() {
        const { name, faceDown } = this.props;
        const { imageUrl, error } = this.state;
        const loading = !name || (!imageUrl && !error && !faceDown);
        const imageUrlToUse = (loading || faceDown) ? cardBack : imageUrl;

        return (
            <div
                className={"card cardDimensions " + (loading ? "loading" : "")}
                style={{ backgroundImage: `url(${imageUrlToUse})` }}
            >
                { loading ? <div className="loader" /> : null}
            </div>
        );
    }
}
