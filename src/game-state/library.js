import '../App.css';
import Card from './card';

export default function Library() {
    return (
        <div className="library gutter">
            <Card name="Enlightened Tutor" faceDown={true} />
        </div>
    );
}