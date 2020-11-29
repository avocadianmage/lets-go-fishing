import '../App.css';
import Card from './card';

export default function Hand() {
    return (
        <div className="hand gutter">
            <Card name="Dispel" />
            <Card name="Abrupt Decay" />
            <Card name="Dockside Extortionist" />
        </div>
    );
}
