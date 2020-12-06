import React from "react";
import Autosuggest from "react-autosuggest";
import DeckImport from './deckImport';
import './textfield.css';

const getSuggestionValue = _ => null;
const renderSuggestion = _ => null;
const onSuggestionsFetchRequested = _ => null;
const onSuggestionsClearRequested = _ => null;

export default class DeckLookup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: "",
            suggestions: [],
        };
    }

    onChange = (_, { newValue }) => {
        this.setState({ value: newValue });
    };

    onKeyDown = event => {
        if (event.key === 'Enter') this.props.onImportClick(this.state.value);
    }

    onFocus = event => event.target.select();

    render() {
        const { value, suggestions } = this.state;
        const inputProps = {
            placeholder: "Enter Moxfield deck web address",
            value,
            onChange: this.onChange,
            onKeyDown: this.onKeyDown,
            onFocus: this.onFocus,
        };
        return (
            <div style={{ position: "relative" }}>
                <Autosuggest
                    inputProps={inputProps}
                    suggestions={suggestions}
                    getSuggestionValue={getSuggestionValue}
                    renderSuggestion={renderSuggestion}
                    onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                    onSuggestionsClearRequested={onSuggestionsClearRequested}
                />
                <DeckImport
                    disabled={!value}
                    onClick={() => this.props.onImportClick(value)}
                />
            </div>
        );
    }
}
