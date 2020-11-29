import './App.css';
import Hand from './game-state/hand';
import Library from './game-state/library';

export default function App() {
    return (
        <div className="bottomPanel">
            <Hand />
            <Library />
        </div>
    );
}


