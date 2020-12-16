import React from 'react';
import Card from './card';
import * as Constants from './constants';

function getCSSNumber(elem, propertyName) {
    return !elem ? 0 : parseFloat(
        getComputedStyle(elem).getPropertyValue(propertyName)
    );
}

export default class Hand extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            width: 0,
        };
    }

    updateWidth = () => this.setState({ width: this.container.clientWidth });

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
        const overlapPx = -this.getOverlapPx() + "px";
        return (
            <div className="hand gutter" ref={div => { this.container = div }}>
                {this.props.contents.map((card, i) => {
                    return <Card 
                        key={i} 
                        info={card} 
                        style={{ marginLeft: i === 0 ? 0 : overlapPx }} 
                    />
                })}
            </div>
        );
    }
}
