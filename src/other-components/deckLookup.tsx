import { Component, FocusEvent, KeyboardEvent } from "react";
import Autosuggest, { ChangeEvent } from "react-autosuggest";
import { DeckImport } from './deckImport';

interface DeckLookupProps {
    onImportClick(value: string): void;
}

interface DeckLookupState {
    value: string;
    suggestions: [];
}

export default class DeckLookup extends Component<
    DeckLookupProps, DeckLookupState
> {
    constructor(props: DeckLookupProps) {
        super(props);
        this.state = {
            value: "",
            suggestions: [],
        };
    }

    onChange = (_: any, { newValue }: ChangeEvent) => {
        this.setState({ value: newValue });
    };

    onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Enter') this.props.onImportClick(this.state.value);
    }

    onFocus = (event: FocusEvent<HTMLInputElement>) => event.target.select();

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
                    getSuggestionValue={() => ""}
                    renderSuggestion={() => null}
                    onSuggestionsFetchRequested={() => null}
                    onSuggestionsClearRequested={() => null}
                />
                <DeckImport
                    disabled={!value}
                    onClick={() => this.props.onImportClick(value)}
                />
            </div>
        );
    }
}
