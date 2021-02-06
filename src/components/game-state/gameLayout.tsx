import { Component } from 'react';
import DeckLookup from '../other-components/deckLookup'
import { DeckInfoService } from '../../services/deckInfoSvc';
import { CardInfo, DatabaseService } from '../../services/dbSvc';
import * as Constants from '../../utilities/constants';
import { shuffle } from '../../utilities/helpers';
import { CardActionInfo } from './card';
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
    drag?: CardActionInfo;
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

    isDragging = false;

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

    onCardDrag = (drag: CardActionInfo) => {
        this.isDragging = true;
        if (!this.state.drag) this.setState({ drag });
        return true;
    }

    onCardDragStop = () => {
        setTimeout(() => (this.isDragging = false));
        const { drag } = this.state;
        if (!drag) return false;
        const { sourceZone, targetZone } = drag;
        this.setState({ drag: undefined });

        if (!sourceZone) return false;
        if (targetZone === ZoneName.None) return false;

        const isFromBattlefield = sourceZone === ZoneName.Battlefield;
        const isInterzoneDrag = !!targetZone && targetZone !== sourceZone;
        const isIntrazoneDrag = !!targetZone && targetZone === sourceZone;
        if (isInterzoneDrag || (isIntrazoneDrag && isFromBattlefield)) {
            this.updateCardFromAction(drag);
        }
        return isInterzoneDrag;
    }

    onCardClick = (drag: CardActionInfo) => {
        // Don't process as a click if the card was dragged.
        if (this.isDragging) return true;

        switch (drag.sourceZone) {
            case ZoneName.Library:
                this.draw();
                break;
            case ZoneName.Battlefield:
                this.updateCardFromAction(drag);
                break;
        }
        return true;
    }

    sliceCardFromZone(zoneCard: ZoneCardInfo, zone: ZoneName) {
        const cards = this.state.zones[zone];
        const index = cards.findIndex(zc => zc.card.id === zoneCard.card.id);
        return [cards.slice(0, index), cards.slice(index + 1)];
    }

    findZoneCard(drag: CardActionInfo) {
        return this.state.zones[drag.sourceZone!].find(zc => zc.card.id === drag.card.id)!;
    }

    fromBattlefield = (action: CardActionInfo) => action.sourceZone === ZoneName.Battlefield;
    toBattlefield = (action: CardActionInfo) => action.targetZone === ZoneName.Battlefield;
    isClick = (action: CardActionInfo) => !action.targetZone;
    isIntrazoneDrag = (action: CardActionInfo) => action.sourceZone === action.targetZone;

    getIncrementedZIndex(zoneName: ZoneName) {
        const zone = this.state.zones[zoneName];
        const highestIndex = zone.some(() => true) ?
            zone.map(zc => zc.zIndex ?? 0).reduce((prev, curr) => Math.max(prev, curr)) : 0;
        return highestIndex + 1;
    }

    updateCardFromAction(action: CardActionInfo) {
        const zoneCard = this.getZoneCardAfterAction(action);
        this.updateCard(zoneCard, action);
    }

    getZoneCardAfterAction(action: CardActionInfo) {
        const { card, node } = action;
        if (
            this.toBattlefield(action) ||
            (this.fromBattlefield(action) && this.isClick(action))
        ) {
            const { x, y } = node!.getBoundingClientRect();
            const zoneCard = this.findZoneCard(action);
            const tapped = this.isClick(action) ? !zoneCard.tapped : zoneCard.tapped;
            return { ...zoneCard, x, y, tapped };
        }
        return { card };
    }

    updateCard(zoneCard: ZoneCardInfo, action: CardActionInfo) {
        const { sourceZone, targetZone } = action;
        if (this.toBattlefield(action)) {
            const zIndex = this.getIncrementedZIndex(ZoneName.Battlefield);
            zoneCard = { ...zoneCard, zIndex };
        }

        const { zones } = this.state;
        const [sourceSlice1, sourceSlice2] = this.sliceCardFromZone(zoneCard, sourceZone);
        if (this.isClick(action) || this.isIntrazoneDrag(action)) {
            const sourceZoneCards = sourceSlice1.concat(zoneCard).concat(sourceSlice2);
            this.updateZonesState(action, sourceZoneCards);
            return;
        }

        const sourceZoneCards = sourceSlice1.concat(sourceSlice2);
        const targetZoneCards = zones[targetZone!].concat(zoneCard);
        this.updateZonesState(action, sourceZoneCards, targetZoneCards);
    }

    updateZonesState(
        action: CardActionInfo,
        sourceZoneCards: ZoneCardInfo[],
        targetZoneCards?: ZoneCardInfo[]
    ) {
        const { sourceZone, targetZone } = action;
        let { zones } = this.state;
        zones = { ...zones, [sourceZone]: sourceZoneCards };
        if (targetZone && targetZoneCards) zones = { ...zones, [targetZone]: targetZoneCards! };
        this.setState({ zones });
    }

    onMouseMove(e: React.MouseEvent) {
        const { drag } = this.state;
        if (!drag) return;
        const mouseOverElems = document.elementsFromPoint(e.clientX, e.clientY);
        const targetElem = mouseOverElems.find(elem => elem.classList.contains('zone'));
        this.setState({
            drag: {
                ...drag,
                targetZone: (targetElem ? targetElem.id as ZoneName : ZoneName.None)
            }
        });
    }

    render() {
        const { zones, drag } = this.state;
        const zoneProps = {
            drag,
            onCardDrag: this.onCardDrag,
            onCardDragStop: this.onCardDragStop,
            onCardClick: this.onCardClick,
        };
        return (
            <>
                <div className="topPanel">
                    <DeckLookup onImportClick={deckUrl => this.importDeck(deckUrl)} />
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
