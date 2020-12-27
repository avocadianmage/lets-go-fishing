import { Component } from 'react';
import { CardInfo } from '../services/dbSvc';
import * as Constants from '../utilities/constants';
import { Card, CardDragEventHandler } from './card';
import { Zone } from './gameLayout';

function getCSSNumber(elem: Element | null, propertyName : string) {
    return !elem ? 0 : parseFloat(
        getComputedStyle(elem).getPropertyValue(propertyName)
    );
}

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
        const leftPad = getCSSNumber(this.container, 'padding-left');
        const rightPad = getCSSNumber(this.container, 'padding-right');
        const handWidthPx = this.state.width - leftPad - rightPad;
        const handSize = this.props.contents.length;
        return -Math.max(
            0,
            Math.ceil(
                (handSize * Constants.CARD_WIDTH_PX - handWidthPx) /
                (handSize - 1)
            )
        ) + 'px';
    }

    fireCardDragStart = (card: CardInfo, elem: HTMLElement) => {
        return this.props.onCardDragStart(card, elem);
    }

    fireCardDragStop = (card: CardInfo, elem: HTMLElement) => {
        return this.props.onCardDragStop(card, elem);
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
