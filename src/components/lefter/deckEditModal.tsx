import {
    Box,
    Button,
    CircularProgress,
    Modal,
    Paper,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material';
import { ModalStyle } from '../../global/constants';
import { Pane } from '../controls/pane';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { GetDeckInfo } from '../../services/deckInfoSvc';
import { DeckFormData, DeckInfo } from '../../services/dbSvc';

export interface DeckEditModalProps {
    isOpen: boolean;
    deckToEdit?: DeckInfo;
    onClose: (deck?: DeckInfo) => void;
}

export enum DeckType {
    Commander = 'commander',
    NotCommander = 'not-commander',
}

export const DeckEditModal = ({ isOpen, deckToEdit, onClose }: DeckEditModalProps) => {
    const getDefaultFormValues = (): DeckFormData => ({
        key: deckToEdit?.key,
        name: deckToEdit?.name || '',
        url: deckToEdit?.url || '',
        contents: deckToEdit?.contents || '',
    });

    const [formValues, setFormValues] = useState<DeckFormData>(getDefaultFormValues());
    const [deckType, setDeckType] = useState(DeckType.Commander);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setFormValues(getDefaultFormValues());
        setDeckType(DeckType.Commander);
    }, [isOpen, deckToEdit]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormValues({ ...formValues, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setLoading(true);
        const deckInfo = await GetDeckInfo(formValues, deckType);
        setLoading(false);

        onClose(deckInfo);
    };

    const handleDeckType = (_: React.MouseEvent<HTMLElement>, newDeckType: DeckType | null) => {
        if (newDeckType !== null) {
            setDeckType(newDeckType);
        }
    };

    return (
        <Modal open={isOpen} onClose={() => onClose()} disableRestoreFocus>
            <Pane sx={{ ...ModalStyle, width: '50vw' }}>
                <Box
                    component='form'
                    onSubmit={handleSubmit}
                    sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                >
                    <Typography variant='h5' color='text.secondary'>
                        Deck Editor
                    </Typography>

                    <Paper>
                        <TextField
                            name='contents'
                            placeholder='Paste deck contents here'
                            fullWidth
                            multiline
                            required
                            autoFocus
                            rows={28}
                            onChange={handleChange}
                            value={formValues.contents}
                            disabled={loading}
                        />
                    </Paper>

                    <ToggleButtonGroup exclusive value={deckType} onChange={handleDeckType}>
                        <ToggleButton value={DeckType.Commander}>Commander</ToggleButton>
                        <ToggleButton value={DeckType.NotCommander}>Not Commander</ToggleButton>
                    </ToggleButtonGroup>

                    <Paper>
                        <TextField
                            name='name'
                            placeholder='Deck name'
                            fullWidth
                            required
                            onChange={handleChange}
                            value={formValues.name}
                            disabled={loading}
                        />
                    </Paper>
                    <Paper>
                        <TextField
                            name='url'
                            placeholder='External link to deck (optional)'
                            fullWidth
                            onChange={handleChange}
                            value={formValues.url}
                            disabled={loading}
                        />
                    </Paper>

                    <Stack
                        direction='row'
                        spacing={2}
                        sx={{ display: 'flex', justifyContent: 'flex-end' }}
                    >
                        <Button type='submit' variant='contained' disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : 'Save'}
                        </Button>
                        <Button color='secondary' onClick={() => onClose()} disabled={loading}>
                            Cancel
                        </Button>
                    </Stack>
                </Box>
            </Pane>
        </Modal>
    );
};
