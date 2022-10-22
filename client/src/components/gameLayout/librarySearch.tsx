import { Autocomplete, Modal, TextField } from '@mui/material';
import { ZoneCardInfo } from './zone';

interface LibrarySearchProps {
    contents: ZoneCardInfo[];
    open: boolean;
    requestClose(): void;
}

export const LibrarySearch = ({ open, contents, requestClose }: LibrarySearchProps) => {
    return (
        <Modal open={open} onClose={requestClose}>
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
            />
        </Modal>
    );
};
