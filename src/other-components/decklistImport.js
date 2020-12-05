import React from "react";
import './flatButton.css';

export default class DecklistImport extends React.Component {
    render() {
        return (
            <button 
                className="flatButton" 
                disabled={this.props.disabled}  
                onClick={this.props.onClick}
            />
        );
    }
}
