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

export const IsCardTransformable = (zoneCard: ZoneCardInfo) => {
    return zoneCard.card.name.includes('//');
};

export const EnableCardAnimation = (zoneCard: ZoneCardInfo) => {
    sessionStorage.setItem(zoneCard.card.id + 'animate', 'true');
};

const queryCardAnimation = (zoneCard?: ZoneCardInfo): boolean => {
    if (!zoneCard) return false;
    const key = zoneCard.card.id + 'animate';
    const enabled = !!sessionStorage.getItem(key);
    if (enabled) setTimeout(() => sessionStorage.removeItem(key), 200);
    return enabled;
};

export const VisualCard = ({ zoneCard, faceDown, wiggle }: VisualCardProps) => {
    const [frontImageUrl, setFrontImageUrl] = useState('');
    const [backImageUrl, setBackImageUrl] = useState('');
    const [canTransform, setCanTransform] = useState(false);

    const card = zoneCard?.card;
    const transformed = zoneCard?.transformed && canTransform;

    const createCardFace = (isFront: boolean) => {
        faceDown = zoneCard ? faceDown : true;

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

    useEffect(() => {
        setFrontImageUrl('');
        setBackImageUrl('');
        setCanTransform(false);
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
            .catch((err) => {
                if (!err.isCanceled) console.log(err);
            });
        return cancel;
    }, [card]);

    const rotate = zoneCard?.tapped ? 90 : 0;
    const rotateY = transformed ? 180 : 0;
    const transform = `rotate(${rotate}deg) rotateY(${rotateY}deg)`;
    const transition = queryCardAnimation(zoneCard) ? 'transform 0.2s ease-in-out' : 'unset';
    const frontCardFace = createCardFace(true);
    const backCardFace = createCardFace(false);
    return (
        <div className='flip-card'>
            <div className='flip-card-inner' style={{ transform, transition }}>
                {frontCardFace}
                {backCardFace}
            </div>
        </div>
    );
};
