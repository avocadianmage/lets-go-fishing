import { Button, Dialog, DialogActions, DialogContent, DialogContentText } from '@mui/material';

interface RestartPopupProps {
    isOpen: boolean;
    onClose(confirm: boolean): void;
}

export const RestartPopup = (props: RestartPopupProps) => {
    const { isOpen, onClose } = props;

    return (
        <Dialog open={isOpen} onClose={() => onClose(false)}>
            <DialogContent>
                <DialogContentText>Are you sure you want to restart?</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    variant='contained'
                    onClick={() => onClose(true)}
                    action={(ref) => ref?.focusVisible()}
                >
                    Restart
                </Button>
                <Button color='secondary' onClick={() => onClose(false)}>
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
};
