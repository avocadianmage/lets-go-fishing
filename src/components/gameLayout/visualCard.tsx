import cardBack from '../../assets/mtg-card-back.png';

import { useEffect, useState } from 'react';
import { cancelablePromise } from '../../global/helpers';
import { CenteredSpinner } from '../controls/centeredSpinner';
import { ZoneCardInfo } from './zone';
import { GetCardImageUrl } from '../../services/cardInfoSvc';

export interface VisualCardProps {
    zoneCard?: ZoneCardInfo;
    faceDown?: boolean;
    wiggle?: boolean;
}

export const VisualCard = ({ zoneCard, faceDown, wiggle }: VisualCardProps) => {
    const [imageUrl, setImageUrl] = useState('');

    faceDown = zoneCard ? faceDown : true;
    const isLoading = !imageUrl && !faceDown;
    const faceUpAndLoaded = !isLoading && !faceDown;

    const card = zoneCard?.card;
    useEffect(() => {
        setImageUrl('');
        if (!card) return;
        const { promise, cancel } = cancelablePromise(GetCardImageUrl(card));
        promise.then((url) => setImageUrl(url)).catch(() => {});
        return cancel;
    }, [card]);

    const imageStyle = { backgroundImage: `url(${isLoading || faceDown ? cardBack : imageUrl})` };
    const className =
        'card' +
        (isLoading ? ' loading' : '') +
        (faceUpAndLoaded && zoneCard?.previewing ? ' previewing' : '') +
        (zoneCard?.tapped ? ' tapped' : '') +
        (wiggle ? ' wiggle' : '');

    return (
        <div id={card?.id} className={className} style={imageStyle}>
            {isLoading ? <CenteredSpinner diameter={80} /> : <div className='card-face' />}
        </div>
    );
};
