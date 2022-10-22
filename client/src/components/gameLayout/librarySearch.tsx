import { Backdrop, Autocomplete, TextField } from '@mui/material';
import { useEffect, useRef } from 'react';
import { ZoneCardInfo } from './zone';

interface LibrarySearchProps {
    contents: ZoneCardInfo[];
    open: boolean;
    requestClose(): void;
}

export const LibrarySearch = ({ open, contents, requestClose }: LibrarySearchProps) => {
    const inputNode = useRef<HTMLInputElement>();

    useEffect(() => {
        const currentInputNode = inputNode.current;
        if (!currentInputNode) return;
        if (open) {
            currentInputNode.focus();
        } else {
            currentInputNode.blur();
        }
    }, [open]);

    return (
        <Backdrop open={open} onClick={requestClose}>
            <Autocomplete
                autoSelect
                autoHighlight
                clearOnBlur
                open={open}
                options={contents.map((option) => option.card.name)}
                sx={{ width: 400, background: 'var(--nord0)' }}
                renderInput={(params) => (
                    <TextField {...params} placeholder='Search library' inputRef={inputNode} />
                )}
            />
        </Backdrop>
    );
};
