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
    const [frontImageUrl, setFrontImageUrl] = useState<string>('');
    const [backImageUrl, setBackImageUrl] = useState<string>('');
    const [canTransform, setCanTransform] = useState(false);

    faceDown = zoneCard ? faceDown : true;
    const transformed = zoneCard?.transformed && canTransform;

    const createCardFace = (isFront: boolean) => {
        const imageUrl = isFront ? frontImageUrl : backImageUrl;
        const isLoading = !imageUrl && !faceDown;
        const faceUpAndLoaded = !isLoading && !faceDown;
        const isFaceShowing = (isFront && !transformed) || (!isFront && transformed);

        const id = isFaceShowing ? card?.id : undefined;
        const className =
            'card' +
            (faceUpAndLoaded && zoneCard?.previewing ? ' previewing' : '') +
            (wiggle ? ' wiggle' : '');
        const imageStyle = {
            backgroundImage: `url(${isLoading || faceDown ? cardBack : imageUrl})`,
        };

        return (
            <div className={isFront ? 'flip-card-front' : 'flip-card-back'}>
                <div id={id} className={className} style={imageStyle}>
                    {isLoading ? <CenteredSpinner diameter={80} /> : <div className='card-face' />}
                </div>
            </div>
        );
    };

    const card = zoneCard?.card;
    useEffect(() => {
        if (!card) return;
        const { promise, cancel } = cancelablePromise(GetCardImageUrl(card.name, card.set));
        promise
            .then(([front, back]) => {
                setFrontImageUrl(front);
                if (back) {
                    setBackImageUrl(back);
                    setCanTransform(true);
                }
            })
            .catch(() => {});
        return cancel;
    }, [card]);

    const rotate = zoneCard?.tapped ? 90 : 0;
    const rotateY = transformed ? 180 : 0;
    const transformCss = `rotate(${rotate}deg) rotateY(${rotateY}deg)`;
    return (
        <div className='flip-card'>
            <div className='flip-card-inner' style={{ transform: transformCss }}>
                {createCardFace(true)}
                {createCardFace(false)}
            </div>
        </div>
    );
};
