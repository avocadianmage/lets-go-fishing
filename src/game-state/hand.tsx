import { Component } from 'react';
import { CardInfo } from '../services/dbSvc';
import { ZONE_PADDING_PX, CARD_WIDTH_PX } from '../utilities/constants';
import { Card, CardDragStartEventHandler, CardDragStopEventHandler, DragInfo } from './card';
import { ZoneName } from './gameLayout';

interface HandProps {
    contents: CardInfo[];
    drag?: DragInfo;
    onCardDragStart: CardDragStartEventHandler;
    onCardDragStop: CardDragStopEventHandler;
}

interface HandState {
    width: number;
}

export default class Hand extends Component<HandProps, HandState> {
    private container: HTMLDivElement | null = null;

    state: HandState = {
        width: 0,
    }

    updateWidth = () => this.setState({ width: this.container!.clientWidth });

    componentDidMount() {
        this.updateWidth();
        window.addEventListener('resize', this.updateWidth);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWidth);
    }

    getLeftForIndex(cardCount: number, index: number) {
        const handWidth = this.state.width - ZONE_PADDING_PX * 2;
        const offset = Math.min(
            CARD_WIDTH_PX,
            (handWidth - CARD_WIDTH_PX) / (cardCount - 1)
        );
        return (offset * index + ZONE_PADDING_PX) + 'px';
    }

    render() {
        const { contents, drag, onCardDragStart, onCardDragStop } = this.props;
        let nondraggedIndex = 0;
        const isSourceZone = drag?.sourceZone === ZoneName.Hand;
        const isTargetZone = drag?.targetZone === ZoneName.Hand;
        const className = 'zone' + (isTargetZone ? ' darken' : '');

        const getCardReposition = (card: CardInfo, index: number) => {
            const isDragging = card.id === drag?.card.id;
            const positioningCardCount = contents.length - (
                (!isSourceZone || isDragging) ? 0 : 1
            );
            const positioningIndex = isDragging ? index : nondraggedIndex++;
            const left = this.getLeftForIndex(
                positioningCardCount, positioningIndex
            );
            return { isDragging, left };
        };

        return (
            <div
                ref={div => { this.container = div }}
                id={ZoneName.Hand}
                className={className}
            >
                {contents.map((card, index) => {
                    const { left, isDragging } = getCardReposition(card, index);
                    return <Card
                        key={card.id}
                        info={card}
                        style={{ left }}
                        darken={isTargetZone && !isDragging}
                        onDragStart={drag => onCardDragStart({ 
                            ...drag, 
                            sourceZone: ZoneName.Hand,
                            targetZone: ZoneName.Hand,
                        })}
                        onDragStop={onCardDragStop}
                    />
                })}
            </div>
        );
    }
}
