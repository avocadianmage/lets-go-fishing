import { Autocomplete, Modal, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
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

const style = {
    position: 'absolute' as 'absolute',
    top: '10%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.default',
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
    return cardOptions;
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
            <Autocomplete
                autoSelect
                autoHighlight
                forcePopupIcon={false}
                open={open}
                options={transformContents(contents)}
                sx={style}
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
                onChange={(_, value) => setSelection(value?.zoneCard)}
                onClose={(_, reason) => setAccepted(reason === 'selectOption')}
            />
        </Modal>
    );
};
