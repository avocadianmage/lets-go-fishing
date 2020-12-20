import React, { MouseEventHandler } from "react";

export interface IDeckImportProps {
    disabled?: boolean;
    onClick?: MouseEventHandler<HTMLButtonElement>;
}


export default class DeckImport extends React.Component<IDeckImportProps> {
    render(): JSX.Element {
        return (
            <button 
                className="flatButton" 
                disabled={this.props.disabled}  
                onClick={this.props.onClick}
            />
        );
    }
}
