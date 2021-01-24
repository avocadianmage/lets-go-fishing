import { Component } from 'react';
import DeckLookup from '../other-components/deckLookup'
import { DeckInfoService } from '../../services/deckInfoSvc';
import { CardInfo, DatabaseService } from '../../services/dbSvc';
import * as Constants from '../../utilities/constants';
import { shuffle } from '../../utilities/helpers';
import { DragInfo } from './card';
import { ZoneCardInfo } from './zone';
import { StackZone } from './stackZone';
import { BattlefieldZone } from './battlefieldZone';

export enum ZoneName {
    None = 'none',
    Library = 'library',
    Hand = 'hand',
    Battlefield = 'battlefield',
};

interface GameLayoutState {
    loading: boolean;
    zones: { [domId: string]: ZoneCardInfo[] };
    drag?: DragInfo;
}

export default class GameLayout extends Component<{}, GameLayoutState> {
    state: GameLayoutState = {
        loading: false,
        zones: {
            [ZoneName.Library]: [],
            [ZoneName.Hand]: [],
            [ZoneName.Battlefield]: [],
        },
    }

    async componentDidMount() {
        const decklist = await DatabaseService.getDeck();
        if (decklist) this.startGame(decklist);
    }

    importDeck(deckUrl: string) {
        this.showLoadingState();
        DeckInfoService.getDecklist(deckUrl)
            .then(decklist => this.startGame(decklist));
    }

    startGame(decklist: CardInfo[]) {
        this.shuffleDeck(decklist);
        this.draw(Constants.STARTING_HAND_SIZE);
    }

    shuffleDeck(decklist: CardInfo[]) {
        this.setState({
            loading: false,
            zones: {
                ...this.state.zones,
                [ZoneName.Library]: shuffle(decklist).map(card => ({ card })),
            },
        });
    }

    draw(num = 1) {
        const { loading, zones } = this.state;
        if (loading) return;
        const handCards = zones[ZoneName.Hand];
        const libraryCards = zones[ZoneName.Library];
        const cutIndex = libraryCards.length - num;
        this.setState({
            zones: {
                ...zones,
                [ZoneName.Hand]: handCards.concat(libraryCards.slice(cutIndex)),
                [ZoneName.Library]: libraryCards.slice(0, cutIndex),
            },
        });
    }

    showLoadingState() {
        this.setState({ loading: true });
    }

    sliceCardFromZone(card: CardInfo, zone: string) {
        const cards = this.state.zones[zone];
        const index = cards.findIndex(zc => zc.card.id === card.id);
        return cards.slice(0, index).concat(cards.slice(index + 1));
    }

    getZoneCardAfterDrag(drag: DragInfo) {
        const { card, node, targetZone } = drag;
        if (targetZone !== ZoneName.Battlefield) return { card };
        const { x, y } = node.getBoundingClientRect();
        return { card, x, y };
    }

    onCardDragStart = (drag: DragInfo) => {
        this.setState({ drag });
        return true;
    }

    onCardDragStop = () => {
        const { drag } = this.state;
        if (!drag) return false;
        const { sourceZone, targetZone } = drag;
        this.setState({ drag: undefined });

        const isFromLibrary = sourceZone === ZoneName.Library;
        const isFromBattlefield = sourceZone === ZoneName.Battlefield;
        const isTrueClick = !targetZone;
        const isIntrazoneDrag = targetZone && targetZone === sourceZone;

        if (!sourceZone) return false;
        if (targetZone === ZoneName.None) return false;

        if (isTrueClick || isIntrazoneDrag) {
            if (isFromLibrary) {
                this.draw();
                return true;
            }
            if (isIntrazoneDrag && isFromBattlefield) this.updateCardFromDrag(drag);
            return false;
        }

        // This is interzone drag.
        this.updateCardFromDrag(drag);
        return true;
    }

    updateCardFromDrag(drag: DragInfo) {
        const { zones } = this.state
        const { card, sourceZone, targetZone } = drag;
        const zoneCard = this.getZoneCardAfterDrag(drag);
        const sourceZoneCards = this.sliceCardFromZone(card, sourceZone!);
        if (sourceZone === targetZone) {
            this.setState({
                zones: {
                    ...zones,
                    [sourceZone!]: sourceZoneCards.concat(zoneCard),
                }
            });
        }
        else {
            this.setState({
                zones: {
                    ...zones,
                    [sourceZone!]: sourceZoneCards,
                    [targetZone!]: zones[targetZone!].concat(zoneCard),
                }
            });
        }
    }

    onMouseMove(e: React.MouseEvent) {
        const { drag } = this.state;
        if (!drag) return;
        const mouseOverElems = document.elementsFromPoint(e.clientX, e.clientY);
        const targetElem = mouseOverElems.find(elem => elem.classList.contains('zone'));
        this.setState({
            drag: {
                ...drag,
                targetZone: targetElem ? targetElem.id : ZoneName.None,
            }
        });
    }

    render() {
        const { zones, drag } = this.state;
        const zoneProps = {
            drag,
            onCardDragStart: this.onCardDragStart,
            onCardDragStop: this.onCardDragStop,
        };
        return (
            <>
                <div className="topPanel">
                    <DeckLookup
                        onImportClick={deckUrl => this.importDeck(deckUrl)}
                    />
                </div>
                <div
                    className="gameLayout"
                    onMouseMove={e => this.onMouseMove(e)}
                >
                    <BattlefieldZone
                        {...zoneProps}
                        name={ZoneName.Battlefield}
                        contents={zones[ZoneName.Battlefield]}
                    />
                    <div className="bottomPanel">
                        <StackZone
                            {...zoneProps}
                            name={ZoneName.Hand}
                            contents={zones[ZoneName.Hand]}
                            enablePreview={true}
                        />
                        <StackZone
                            {...zoneProps}
                            name={ZoneName.Library}
                            contents={zones[ZoneName.Library]}
                            faceDown={true}
                            maxToShow={2}
                        />
                    </div>
                </div>
            </>
        );
    }
}
