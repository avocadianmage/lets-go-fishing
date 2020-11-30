import React from "react";
import Autosuggest from "react-autosuggest";
import './textfield.css';

const getSuggestionValue = _ => null;
const renderSuggestion = _ => null;
const onSuggestionsFetchRequested = _ => null;
const onSuggestionsClearRequested = _ => null;

export default class DecklistLookup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: "",
            suggestions: [],
        };
    }

    onChange = (event, { newValue }) => { //ckgtest
        this.setState({ value: newValue });
    };

    render() {
        const { value, suggestions } = this.state;
        const inputProps = {
            placeholder: "Enter Moxfield deck web address",
            value,
            onChange: this.onChange
        };
        return (
            <Autosuggest 
                inputProps={inputProps} 
                suggestions={suggestions}
                getSuggestionValue={getSuggestionValue}
                renderSuggestion={renderSuggestion}
                onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                onSuggestionsClearRequested={onSuggestionsClearRequested} />
        );
    }
}
