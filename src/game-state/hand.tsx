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

    repositionCards(draggingCardElem?: HTMLElement) {
        const cardElems = this.container?.children;
        if (!cardElems) return;

        const cardCount = this.props.contents.length - (
            draggingCardElem ? 1 : 0
        );
        let positioningIndex = 0;
        for (let i = 0; i < cardElems.length; i++) {
            const iElem = cardElems[i];
            if (iElem === draggingCardElem) continue;
            const left = this.getLeftForIndex(cardCount, positioningIndex++);
            (iElem as HTMLElement).style.left = left;
        }
    }

    fireCardDragStart = (card: CardInfo, elem: HTMLElement) => {
        const success =  this.props.onCardDragStart(card, elem, Zone.Hand);
        if (success) this.repositionCards(elem);
        return success;
    }

    fireCardDragStop = (card: CardInfo, elem: HTMLElement) => {
        const success = this.props.onCardDragStop(card, elem, Zone.Hand);
        if (!success) this.repositionCards();
        return success;
    }

    render() {
        const { contents } = this.props;
        return (
            <div
                ref={div => { this.container = div }}
                id={Zone.Hand}
                className='hand zone'
            >
                {contents.map((card, index) => {
                    return <Card
                        key={card.id}
                        info={card}
                        style={{ 
                            left: this.getLeftForIndex(contents.length, index),
                        }}
                        onDragStart={this.fireCardDragStart}
                        onDragStop={this.fireCardDragStop}
                    />
                })}
            </div>
        );
    }
}
