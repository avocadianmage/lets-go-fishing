import { Component } from 'react';
import { CardInfo } from '../services/dbSvc';
import { ZONE_PADDING_PX, CARD_WIDTH_PX } from '../utilities/constants';
import { Card, CardDragEventHandler } from './card';
import { Zone } from './gameLayout';

interface HandProps {
    contents: CardInfo[];
    onCardDragStart: CardDragEventHandler;
    onCardDragStop: CardDragEventHandler;
}

interface HandState {
    width: number;
    draggingCard?: CardInfo;
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

    fireCardDragStart = (card: CardInfo) => {
        this.setState({ draggingCard: card });
        return this.props.onCardDragStart(card, Zone.Hand);
    }

    fireCardDragStop = (card: CardInfo) => {
        this.setState({ draggingCard: undefined });
        return this.props.onCardDragStop(card, Zone.Hand);
    }

    render() {
        const { contents } = this.props;
        const { draggingCard } = this.state;
        let nondraggedIndex = 0;
        return (
            <div
                ref={div => { this.container = div }}
                id={Zone.Hand}
                className='hand zone'
            >
                {contents.map((card, index) => {
                    const isThisDraggingCard = card.id === draggingCard?.id;
                    const positioningCardCount = contents.length - (
                        (!draggingCard || isThisDraggingCard) ? 0 : 1
                    );
                    const positioningIndex = isThisDraggingCard ?
                        index : nondraggedIndex++;
                    return <Card
                        key={card.id}
                        info={card}
                        style={{
                            left: this.getLeftForIndex(
                                positioningCardCount, positioningIndex
                            ),
                        }}
                        onDragStart={this.fireCardDragStart}
                        onDragStop={this.fireCardDragStop}
                    />
                })}
            </div>
        );
    }
}
