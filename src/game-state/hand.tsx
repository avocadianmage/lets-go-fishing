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

    getLeftMargin() {
        const handWidth = this.state.width - ZONE_PADDING_PX * 2;
        const cardCount = this.props.contents.length;
        return -Math.max(
            0,
            Math.ceil((cardCount * CARD_WIDTH_PX - handWidth) / (cardCount - 1))
        ) + 'px';
    }

    fireCardDragStart = (card: CardInfo) => {
        return this.props.onCardDragStart(card, Zone.Hand);
    }

    fireCardDragStop = (card: CardInfo) => {
        return this.props.onCardDragStop(card, Zone.Hand);
    }

    render() {
        const overlap = this.getLeftMargin();
        return (
            <div 
            ref={div => { this.container = div }} 
            id={Zone.Hand}
            className='hand zone'
        >
                {this.props.contents.map((card, index) => {
                    return <Card
                        key={card.id}
                        info={card}
                        style={{marginLeft: index === 0 ? 0 : overlap}}
                        onDragStart={this.fireCardDragStart}
                        onDragStop={this.fireCardDragStop}
                    />
                })}
            </div>
        );
    }
}
