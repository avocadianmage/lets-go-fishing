import cardBack from '../../assets/mtg-card-back.png';
import '../css/card.css';

import { useEffect, useState } from 'react';
import { CardInfoService } from '../../services/cardInfoSvc';
import { cancelablePromise } from '../../global/helpers';
import { ZoneCardInfo } from './zone';
import { Spinner } from '../util/spinner';

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
            {isLoading ? <Spinner /> : <div className='card-face' />}
        </div>
    );
};
