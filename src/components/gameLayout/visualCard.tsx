import cardBack from '../../assets/mtg-card-back.png';

import { useEffect, useState } from 'react';
import { cancelablePromise } from '../../global/helpers';
import { CenteredSpinner } from '../controls/centeredSpinner';
import { ZoneCardInfo } from './zone';
import { GetCardImageUrl } from '../../services/cardInfoSvc';

export interface VisualCardProps {
    zoneCard?: ZoneCardInfo;
    faceDown?: boolean;
    transformed?: boolean;
    wiggle?: boolean;
}

export const VisualCard = ({ zoneCard, faceDown, transformed, wiggle }: VisualCardProps) => {
    const [frontImageUrl, setFrontImageUrl] = useState<string>('');
    const [backImageUrl, setBackImageUrl] = useState<string | undefined>(undefined);

    faceDown = zoneCard ? faceDown : true;
    const isLoading = !frontImageUrl && !faceDown;
    const faceUpAndLoaded = !isLoading && !faceDown;

    const card = zoneCard?.card;
    useEffect(() => {
        if (!card) return;
        const { promise, cancel } = cancelablePromise(GetCardImageUrl(card.name, card.set));
        promise
            .then(([front, back]) => {
                setFrontImageUrl(front);
                setBackImageUrl(back);
            })
            .catch(() => {});
        return cancel;
    }, [card]);

    const imageStyle = {
        backgroundImage: `url(${isLoading || faceDown ? cardBack : frontImageUrl})`,
    };
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
