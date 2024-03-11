import cardBack from '../../assets/mtg-card-back.png';

import { useEffect, useState } from 'react';
import { cancelablePromise } from '../../global/helpers';
import { CenteredSpinner } from '../controls/centeredSpinner';
import { ZoneCardInfo } from './zone';
import { GetCardImageUrl } from '../../services/cardInfoSvc';
import { Chip, SxProps } from '@mui/material';

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

const chipSx: SxProps = {
    width: 'fit-content',
    height: 'fit-content',
    position: 'absolute',
    zIndex: 1,
    left: 0,
    right: 0,
    top: '25%',
    m: 'auto',
    color: 'black',
    bgcolor: 'rgba(255, 255, 255, 0.7)',
    fontSize: '2.5rem',
};

const animDurationMs = 200;

const queryCardAnimation = (zoneCard?: ZoneCardInfo): boolean => {
    if (!zoneCard) return false;
    const key = zoneCard.card.id + 'animate';
    const enabled = !!sessionStorage.getItem(key);
    if (enabled) setTimeout(() => sessionStorage.removeItem(key), animDurationMs);
    return enabled;
};

export const VisualCard = ({ zoneCard, faceDown, wiggle }: VisualCardProps) => {
    const [frontImageUrl, setFrontImageUrl] = useState('');
    const [backImageUrl, setBackImageUrl] = useState('');
    const [canTransform, setCanTransform] = useState(false);

    const card = zoneCard?.card;
    const transformed = zoneCard?.transformed && canTransform;
    const counters = zoneCard?.counters;

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

    const doAnimation = queryCardAnimation(zoneCard);
    const animDurationStyle = `${animDurationMs / 1000}s`;
    const generalTransition = doAnimation ? `transform ${animDurationStyle} ease-in-out` : 'unset';
    const cardRotate = zoneCard?.tapped ? 90 : 0;
    const rotateY = transformed ? 180 : 0;
    const cardTransform = `rotate(${cardRotate}deg) rotateY(${rotateY}deg)`;
    
    const counterLabel = counters ? (counters > 0 ? '+' : '') + counters : '';
    const counterRotate = zoneCard?.tapped ? -90 : 0; // Counteracts the card rotation to keep it shown right-side-up
    const counterTransform = `rotate(${counterRotate}deg)`;
    const counterScale = transformed ? '-1 1' : 'unset'; // Counteracts the card flip to keep it shown left-to-right
    const scaleTransition = `scale ${animDurationStyle} steps(2, jump-none)`; // Stays at initial state until halfway, then jumps to final state
    const counterTransition = doAnimation ? `${generalTransition}, ${scaleTransition}` : 'unset';

    const frontCardFace = createCardFace(true);
    const backCardFace = createCardFace(false);

    return (
        <div className='flip-card'>
            <div className='flip-card-inner' style={{ transform: cardTransform, transition: generalTransition }}>
                <Chip
                    sx={{ ...chipSx, transform: counterTransform, scale: counterScale, transition: counterTransition }}
                    label={counterLabel}
                />
                {frontCardFace}
                {backCardFace}
            </div>
        </div>
    );
};