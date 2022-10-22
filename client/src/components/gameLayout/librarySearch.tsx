import { Backdrop, Autocomplete, TextField } from '@mui/material';
import { ZoneCardInfo } from './zone';

interface LibrarySearchProps {
    contents: ZoneCardInfo[];
    open: boolean;
}

export const LibrarySearch = ({ open, contents }: LibrarySearchProps) => {
    return (
        <Backdrop open={open}>
            <Autocomplete
                autoSelect
                autoHighlight
                open={open}
                options={contents.map(option => option.card.name)}
                sx={{ width: 400, background: 'var(--nord0)' }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder='Search library'
                        inputRef={(input) => input && input.focus()}
                    />
                )}
            />
        </Backdrop>
    );
};
