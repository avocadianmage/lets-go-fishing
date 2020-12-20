import React, { useEffect, useState } from 'react';
import { CardInfoService } from '../services/cardInfoSvc';

import cardBack from '../assets/mtg-card-back.png';

export const Card = ({ info, faceDown, style, onClick }) => {
    const [imageUrl, setImageUrl] = useState(null);

    const isLoading = !info || (!imageUrl && !faceDown);

    // Perform card image lookup when info is set.
    useEffect(() => {
        if (!info) return;
        CardInfoService.getCardImageBlob(info.name, info.set)
            .then(blob => setImageUrl(URL.createObjectURL(blob)));
    }, [info]);

    const getStyling = () => {
        const imageUrlToUse = (isLoading || faceDown) ? cardBack : imageUrl;
        return Object.assign(
            { backgroundImage: `url(${imageUrlToUse})` },
            style,
        );
    };

    const getClasses = () => {
        return "card " +
            (isLoading ? "loading " : "") +
            (!isLoading && !faceDown && info.foil ? "foil " : "");
    };

    return (
        <div className={getClasses()} style={getStyling()} onClick={onClick}>
            {isLoading ?
                <div className="loader" /> :
                (!faceDown && <div className={"card-face"} />)
            }
        </div>
    );
};
