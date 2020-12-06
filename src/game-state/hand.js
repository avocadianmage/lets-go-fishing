import React from 'react';
import '../App.css';
import Card from './card';

export default class Hand extends React.Component {
    renderCard(key, name) {
        return <Card key={key} name={name} />;
    }

    render() {
        const { contents } = this.props;
        return (
            <div className="hand gutter">
                {contents.map((name, i) => this.renderCard(i, name))}
            </div>
        );
    }
}
