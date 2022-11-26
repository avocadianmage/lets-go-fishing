import cardBack from '../../assets/mtg-card-back.png';
import '../css/card.css';

import { useEffect, useState } from 'react';
import { cancelablePromise } from '../../global/helpers';
import { CardInfoService } from '../../services/cardInfoSvc';
import { CenteredSpinner } from '../util/centeredSpinner';
import { ZoneCardInfo } from './zone';

export interface VisualCardProps {
    zoneCard: ZoneCardInfo;
    faceDown?: boolean;
    wiggle?: boolean;
}

export const VisualCard = ({ zoneCard, faceDown, wiggle }: VisualCardProps) => {
    const [imageUrl, setImageUrl] = useState('');

    const { card, previewing, tapped } = zoneCard;
    const isLoading = !imageUrl && !faceDown;
    const faceUpAndLoaded = !isLoading && !faceDown;

    useEffect(() => {
        setImageUrl('');
        const { promise, cancel } = cancelablePromise(CardInfoService.getCardImageUrl(card));
        promise.then((url) => setImageUrl(url)).catch(() => {});
        return cancel;
    }, [card]);

    const imageStyle = { backgroundImage: `url(${isLoading || faceDown ? cardBack : imageUrl})` };
    const className =
        'card' +
        (isLoading ? ' loading' : '') +
        (faceUpAndLoaded && previewing ? ' previewing' : '') +
        (tapped ? ' tapped' : '') +
        (wiggle ? ' wiggle' : '');

    return (
        <div className={className} style={imageStyle}>
            {isLoading ? <CenteredSpinner diameter={80} /> : <div className='card-face' />}
        </div>
    );
};
