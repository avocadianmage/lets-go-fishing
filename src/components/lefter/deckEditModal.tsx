import { Box, Button, Modal, Paper, Stack, TextField } from '@mui/material';
import { ModalStyle } from '../../global/constants';
import { Pane } from '../controls/pane';
import { ChangeEvent, FormEvent, useState } from 'react';
import { DeckFormData, GetDeckInfo } from '../../services/deckInfoSvc';
import { DeckInfo } from '../../services/dbSvc';

export interface DeckEditProps {
    isOpen: boolean;
    onClose: (deck?: DeckInfo) => void;
}

export const DeckEditModal = ({ isOpen, onClose }: DeckEditProps) => {
    const [formValues, setFormValues] = useState<DeckFormData>({
        name: '',
        url: '',
        contents: '',
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormValues({ ...formValues, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onClose(GetDeckInfo(formValues));
    };

    return (
        <Modal open={isOpen} onClose={() => onClose()} disableRestoreFocus>
            <Pane sx={{ ...ModalStyle, width: '50vw' }}>
                <Box
                    component='form'
                    onSubmit={handleSubmit}
                    sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                >
                    <Paper>
                        <TextField
                            name='name'
                            placeholder='Deck name'
                            fullWidth
                            required
                            autoFocus
                            onChange={handleChange}
                        />
                    </Paper>
                    <Paper>
                        <TextField
                            name='url'
                            placeholder='External link to deck (optional)'
                            fullWidth
                            onChange={handleChange}
                        />
                    </Paper>
                    <Paper>
                        <TextField
                            name='contents'
                            placeholder='Paste deck contents here'
                            fullWidth
                            multiline
                            required
                            rows={28}
                            onChange={handleChange}
                        />
                    </Paper>
                    <Stack
                        direction='row'
                        spacing={2}
                        sx={{ display: 'flex', justifyContent: 'flex-end' }}
                    >
                        <Button type='submit' variant='contained'>
                            Save
                        </Button>
                        <Button color='secondary' onClick={() => onClose()}>
                            Cancel
                        </Button>
                    </Stack>
                </Box>
            </Pane>
        </Modal>
    );
};
