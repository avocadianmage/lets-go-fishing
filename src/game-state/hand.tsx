import { Component } from 'react';
import { CardInfo } from '../services/dbSvc';
import { ZONE_PADDING_PX, CARD_WIDTH_PX } from '../utilities/constants';
import { Card, CardDragStartEventHandler, CardDragStopEventHandler, DragInfo } from './card';
import { Zone } from './gameLayout';

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

    fireCardDragStart = (drag: DragInfo) => {
        return this.props.onCardDragStart({ ...drag, sourceZone: Zone.Hand });
    }

    render() {
        const { contents, drag } = this.props;
        let nondraggedIndex = 0;
        const className = 'hand zone' +
            (drag?.targetZone === Zone.Hand ? ' drag-over' : '');
        return (
            <div
                ref={div => { this.container = div }}
                id={Zone.Hand}
                className={className}
            >
                {contents.map((card, index) => {
                    const isThisDraggingCard = card.id === drag?.card.id;
                    const positioningCardCount = contents.length - (
                        (!drag?.card || isThisDraggingCard) ? 0 : 1
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
                        onDragStop={this.props.onCardDragStop}
                    />
                })}
            </div>
        );
    }
}
