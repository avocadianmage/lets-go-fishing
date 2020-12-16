import './App.css';
import './game-state/gameLayout.css';
import './game-state/card.css';
import './other-components/flatButton.css';
import './other-components/textfield.css';

import DeckLookup from './other-components/deckLookup';
import GameLayout from './game-state/gameLayout';

export default function App() {
    return (
        <div>
            <div className="topPanel">
                <DeckLookup
                    onImportClick={deckUrl => this.importDeck(deckUrl)}
                />
            </div>
            <GameLayout />
        </div>
    );
}
