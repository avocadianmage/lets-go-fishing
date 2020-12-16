import React from "react";

export default class DeckImport extends React.Component {
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
