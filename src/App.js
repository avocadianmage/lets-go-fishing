import './App.css';
import DecklistLookup from './other-components/decklistLookup';
import GameLayout from './game-state/gameLayout';

export default function App() {
    return (
        <div>
            <div className="topPanel">
                <DecklistLookup />
            </div>
            <GameLayout />
        </div>
    );
}


