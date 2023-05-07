import { Autocomplete, Modal, TextField } from '@mui/material';
import { SxProps, Theme } from '@mui/system';
import { useEffect, useState } from 'react';
import { Pane, ZoneName } from './gameLayout';
import { IsCardTransformable, VisualCard } from './visualCard';
import { ZoneCardInfo } from './zone';

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
    const [selection, setSelection] = useState<ZoneCardInfo>();
    const [accepted, setAccepted] = useState<boolean>();

    const createZoneCard = (transformed: boolean): ZoneCardInfo | undefined => {
        return selection ? { ...selection, transformed } : undefined;
    };

    const frontCard = createZoneCard(false);
    const backCard = selection && IsCardTransformable(selection) ? createZoneCard(true) : undefined;
    const open = !!zone;

    useEffect(() => {
        if (accepted !== undefined) {
            setAccepted(undefined);
            requestClose(accepted ? selection : undefined);
        }
    }, [accepted, selection, requestClose]);

    return (
        <Modal open={open} onClose={() => requestClose()}>
            <Pane sx={{ ...style, display: 'flex', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <VisualCard zoneCard={frontCard} />
                    <VisualCard zoneCard={backCard} />
                </div>
                <Autocomplete
                    sx={{ width: 600 }}
                    autoSelect
                    autoHighlight
                    forcePopupIcon={false}
                    open={open}
                    options={transformContents(contents)}
                    isOptionEqualToValue={(option, value) => option.label === value.label}
                    renderInput={(props) => (
                        <TextField {...props} placeholder={`Search ${zone}`} autoFocus />
                    )}
                    renderOption={(props, { label, count }) => (
                        <li {...props}>
                            <div style={{ width: '100%' }}>
                                {label}
                                <span style={{ float: 'right' }}>
                                    <span style={{ fontSize: '0.8em' }}>x</span>&nbsp;{count}
                                </span>
                            </div>
                        </li>
                    )}
                    ListboxProps={{ style: { maxHeight: '60vh' } }}
                    onHighlightChange={(_, value) => setSelection(value?.zoneCard)}
                    onChange={(_, value) => setSelection(value?.zoneCard)}
                    onClose={(_, reason) => setAccepted(reason === 'selectOption')}
                />
            </Pane>
        </Modal>
    );
};
