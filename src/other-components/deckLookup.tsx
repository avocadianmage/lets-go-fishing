import React from "react";
import Autosuggest, { ChangeEvent, InputProps, GetSuggestionValue, RenderSuggestion, SuggestionsFetchRequested, OnSuggestionsClearRequested } from "react-autosuggest";
import DeckImport from './deckImport';

const getSuggestionValue: GetSuggestionValue<string> = (_: string) => "";
const renderSuggestion: RenderSuggestion<string> = (_: string, _2: any) => null;
const onSuggestionsFetchRequested: SuggestionsFetchRequested = (_: any) => null;
const onSuggestionsClearRequested: OnSuggestionsClearRequested = () => null;

export interface IDeckLookupProps {
    onImportClick(value: string): void;
}

export interface IDeckLookupState {
    value: string,
    suggestions: string[]
}

export default class DeckLookup extends React.Component<IDeckLookupProps, IDeckLookupState> {
    constructor(props: IDeckLookupProps) {
        super(props);
        this.state = {
            value: "",
            suggestions: [],
        };
    }

    onChange = (_: any, args: ChangeEvent) => {
        this.setState({ value: args.newValue });
    };

    onKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') this.props.onImportClick(this.state.value);
    }

    onFocus = (event: React.FocusEvent<HTMLInputElement>) => event.target.select();

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
