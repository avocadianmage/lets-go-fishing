import { Card, ListItem, ListItemButton, ListItemText, Modal, Paper } from '@mui/material';
import { SxProps, Theme } from '@mui/system';
import { createRef, useState } from 'react';
import { Pane, ZoneName } from './gameLayout';
import { IsCardTransformable, VisualCard } from './visualCard';
import { ZoneCardInfo } from './zone';
import { StyledTextField } from '../controls/styledTextField';
import { CARD_HEIGHT_PX } from '../../global/constants';
import { FixedSizeList, ListChildComponentProps } from 'react-window';

interface SearchZoneProps {
    zone?: ZoneName;
    contents: ZoneCardInfo[];
    requestClose(selection?: ZoneCardInfo): void;
}

interface CardOptionProps {
    label: string;
    zoneCard: ZoneCardInfo;
    count: number;
}

const style: SxProps<Theme> = {
    position: 'absolute' as 'absolute',
    top: '10%',
    left: '50%',
    transform: 'translate(-50%, -10%)',
    bgcolor: 'background.default',
    p: '12px',
};

const transformContents = (contents: ZoneCardInfo[]) => {
    const map: { [label: string]: CardOptionProps } = {};
    contents.forEach((zoneCard) => {
        const label: string = zoneCard.card.name;
        if (map[label]) map[label].count++;
        else map[label] = { label, zoneCard, count: 1 };
    });

    const cardOptions = [];
    for (let label in map) cardOptions.push(map[label]);
    return cardOptions.reverse();
};

export const SearchZone = ({ zone, contents, requestClose }: SearchZoneProps) => {
    const [searchString, setSearchString] = useState('');
    const [selectedIndex, setSelectedIndex] = useState<number>(0);

    const options = transformContents(contents).filter((c) =>
        c.label.toLowerCase().includes(searchString)
    );
    const selectedZoneCard = options.length > 0 ? options[selectedIndex].zoneCard : undefined;

    const listRef = createRef<FixedSizeList>();

    const createZoneCard = (transformed: boolean): ZoneCardInfo | undefined => {
        return selectedZoneCard ? { ...selectedZoneCard, transformed } : undefined;
    };

    const frontCard = createZoneCard(false);
    const backCard =
        selectedZoneCard && IsCardTransformable(selectedZoneCard)
            ? createZoneCard(true)
            : undefined;
    let open = !!zone;

    const close = (cardIndexToSend?: number) => {
        requestClose(cardIndexToSend !== undefined ? options[cardIndexToSend].zoneCard : undefined);

        setSearchString('');
        setSelectedIndex(0);
    };

    const processKeys = (key: string) => {
        switch (key) {
            case 'Enter':
                if (selectedZoneCard) close(selectedIndex);
                break;
            case 'ArrowUp':
                setSelectedIndex((si) => {
                    const newIndex = Math.max(0, si - 1);
                    listRef.current?.scrollToItem(newIndex);
                    return newIndex;
                });
                break;
            case 'ArrowDown':
                setSelectedIndex((si) => {
                    const newIndex = Math.min(options.length - 1, si + 1);
                    listRef.current?.scrollToItem(newIndex);
                    return newIndex;
                });
                break;
        }
    };

    const renderRow = (props: ListChildComponentProps) => {
        const { index, style } = props;
        const { label, count } = options[index];
        return (
            <ListItem style={style} key={index} disablePadding>
                <ListItemButton selected={index === selectedIndex} onClick={() => close(index)}>
                    <ListItemText primary={label} secondary={count > 1 ? `x${count}` : undefined} />
                </ListItemButton>
            </ListItem>
        );
    };

    return (
        <Modal open={open} onClose={() => close(undefined)}>
            <Pane
                sx={{ ...style, display: 'flex', gap: '12px', height: `${CARD_HEIGHT_PX * 2}px` }}
            >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <VisualCard zoneCard={frontCard} />
                    <VisualCard zoneCard={backCard} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Paper>
                        <StyledTextField
                            sx={{ width: 400 }}
                            placeholder={`Search ${zone}`}
                            autoFocus
                            onChange={(e) => setSearchString(e.target.value.toLowerCase())}
                            onKeyDown={(e) => processKeys(e.key)}
                        />
                    </Paper>
                    <Card sx={{ marginBottom: '1px' }}>
                        <FixedSizeList
                            ref={listRef}
                            itemCount={options.length}
                            itemSize={48}
                            width={400}
                            height={CARD_HEIGHT_PX * 2 - 8 - 56}
                        >
                            {renderRow}
                        </FixedSizeList>
                    </Card>
                </div>
            </Pane>
        </Modal>
    );
};
