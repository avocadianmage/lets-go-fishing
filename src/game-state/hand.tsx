import { Component } from 'react';
import { CardInfo } from '../services/dbSvc';
import * as Constants from '../utilities/constants';
import { Card } from './card';

function getCSSNumber(elem: Element | null, propertyName : string) {
    return !elem ? 0 : parseFloat(
        getComputedStyle(elem).getPropertyValue(propertyName)
    );
}

interface HandProps {
    contents: CardInfo[],
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

    getOverlapPx() {
        const leftPad = getCSSNumber(this.container, 'padding-left');
        const rightPad = getCSSNumber(this.container, 'padding-right');
        const handWidthPx = this.state.width - leftPad - rightPad;
        const handSize = this.props.contents.length;
        return Math.max(
            0,
            Math.ceil(
                (handSize * Constants.CARD_WIDTH_PX - handWidthPx) /
                (handSize - 1)
            )
        );
    }

    render() {
        const { contents } = this.props;
        const overlapPx = -this.getOverlapPx() + "px";
        return (
            <div ref={div => { this.container = div }} className="hand zone">
                {contents.map((card, index) => {
                    return <Card
                        key={index}
                        info={card}
                        style={{marginLeft: index === 0 ? 0 : overlapPx}}
                    />
                })}
            </div>
        );
    }
}
