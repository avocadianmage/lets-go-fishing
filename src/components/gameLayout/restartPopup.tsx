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
                    onClick={() => onClose(true)}
                    action={(ref) => ref?.focusVisible()}
                    disableFocusRipple
                >
                    RESTART
                </Button>
                <Button onClick={() => onClose(false)} disableFocusRipple>
                    CANCEL
                </Button>
            </DialogActions>
        </Dialog>
    );
};
