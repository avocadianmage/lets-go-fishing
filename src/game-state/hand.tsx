import React from 'react';
import * as Constants from '../utilities/constants';
import { Card } from './card';

function getCSSNumber(elem: Element, propertyName: string): number {
    return !elem ? 0 : parseFloat(
        getComputedStyle(elem).getPropertyValue(propertyName)
    );
}

export interface IHandProps {
    contents: any[];
}

export interface IHandState {
    width: number;
}

export default class Hand extends React.Component<IHandProps, IHandState> {
    public container: HTMLDivElement | null = null;

    constructor(props: IHandProps) {
        super(props);
        this.state = {
            width: 0,
        };
    }

    updateWidth = (): void => this.setState({ width: this.container!.clientWidth });

    componentDidMount(): void {
        this.updateWidth();
        window.addEventListener('resize', this.updateWidth);
    }

    componentWillUnmount(): void {
        window.removeEventListener('resize', this.updateWidth);
    }

    getOverlapPx(): number {
        const leftPad = getCSSNumber(this.container!, 'padding-left');
        const rightPad = getCSSNumber(this.container!, 'padding-right');
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

    render(): JSX.Element {
        const overlapPx = -this.getOverlapPx() + "px";
        return (
            <div ref={div => { this.container = div }} className="hand gutter">
                {this.props.contents.map((card, index) => {
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
