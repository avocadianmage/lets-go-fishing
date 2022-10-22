import { Autocomplete, Modal, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { ZoneCardInfo } from './zone';

interface LibrarySearchProps {
    contents: ZoneCardInfo[];
    open: boolean;
    requestClose(selection?: string): void;
}

export const LibrarySearch = ({ open, contents, requestClose }: LibrarySearchProps) => {
    const [selection, setSelection] = useState<string>();
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
                options={contents.map((option) => option.card.name)}
                sx={{ width: 400, background: 'var(--nord0)' }}
                renderInput={(params) => (
                    <TextField {...params} placeholder='Search library' autoFocus />
                )}
                onChange={(_, value) => setSelection(value ?? undefined)}
                onClose={(_, reason) => setAccepted(reason === 'selectOption' || reason === 'blur')}
            />
        </Modal>
    );
};
