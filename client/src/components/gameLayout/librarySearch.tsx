import { Autocomplete, Modal, TextField } from '@mui/material';
import { SxProps, Theme } from '@mui/system';
import { useEffect, useState } from 'react';
import { Card } from './card';
import { Pane } from './gameLayout';
import { ZoneCardInfo } from './zone';

interface LibrarySearchProps {
    contents: ZoneCardInfo[];
    open: boolean;
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
    return cardOptions.sort((a, b) => a.label.localeCompare(b.label));
};

export const LibrarySearch = ({ open, contents, requestClose }: LibrarySearchProps) => {
    const [selection, setSelection] = useState<ZoneCardInfo>();
    const [accepted, setAccepted] = useState<boolean>();

    useEffect(() => {
        if (accepted !== undefined) {
            setAccepted(undefined);
            requestClose(accepted ? selection : undefined);
        }
    }, [accepted, selection, requestClose]);

    return (
        <Modal open={open} onClose={() => requestClose()}>
            <Pane sx={{ ...style, display: 'flex', gap: '12px' }}>
                {selection && <Card zoneCard={selection} disabled={true} />}
                <Autocomplete
                    sx={{ width: 600 }}
                    autoSelect
                    autoHighlight
                    forcePopupIcon={false}
                    open={open}
                    options={transformContents(contents)}
                    isOptionEqualToValue={(option, value) => option.label === value.label}
                    renderInput={(props) => (
                        <TextField {...props} placeholder='Search library' autoFocus />
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
                    onHighlightChange={(_, value) => setSelection(value?.zoneCard)}
                    onClose={(_, reason) => setAccepted(reason === 'selectOption')}
                />
            </Pane>
        </Modal>
    );
};
