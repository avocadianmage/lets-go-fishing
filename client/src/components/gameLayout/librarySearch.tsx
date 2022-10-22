import { Autocomplete, Modal, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { ZoneCardInfo } from './zone';

interface LibrarySearchProps {
    contents: ZoneCardInfo[];
    open: boolean;
    requestClose(selection?: ZoneCardInfo): void;
}

const style = {
    position: 'absolute' as 'absolute',
    top: '10%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.default'
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
                options={contents.map((zoneCard) => ({ label: zoneCard.card.name, zoneCard }))}
                sx={style}
                renderInput={(params) => (
                    <TextField {...params} placeholder='Search library' autoFocus />
                )}
                onChange={(_, value) => setSelection(value?.zoneCard)}
                onClose={(_, reason) => setAccepted(reason === 'selectOption')}
            />
        </Modal>
    );
};
