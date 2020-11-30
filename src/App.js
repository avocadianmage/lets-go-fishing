import './App.css';
import DecklistLookup from './other-components/decklistLookup';
import Hand from './game-state/hand';
import Library from './game-state/library';

export default function App() {
    return (
        <div>
            <div>
                <DecklistLookup />
            </div>
            <div className="bottomPanel">
                <Hand />
                <Library />
            </div>
        </div>
    );
}


