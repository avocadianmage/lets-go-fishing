import React from 'react';
import { CardInfoService } from '../services/cardInfoSvc';

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
        const { info } = this.props;
        if (!info) return;
        CardInfoService.getCardImageBlob(info.name, info.set)
            .then(blob => this.setState({
                imageUrl: URL.createObjectURL(blob)
            }));
    }

    render() {
        const { info, faceDown, onClick, style } = this.props;
        const { imageUrl, error } = this.state;

        const loading = !info || (!imageUrl && !error && !faceDown);
        const showFoil = !loading && !faceDown && info.foil;

        const imageUrlToUse = (loading || faceDown) ? cardBack : imageUrl;
        const allStyles = Object.assign(
            { backgroundImage: `url(${imageUrlToUse})` },
            style,
        );

        return (
            <div
                className={"card " + (loading ? "loading " : "")}
                style={allStyles}
                onClick={onClick}
            >
                {loading ? 
                    <div className="loader" /> : 
                    (!faceDown ?
                        <div className={
                            "card-face " + (showFoil ? "foil " : "")
                        } /> : 
                        null
                    )
                }
            </div>
        );
    }
}
