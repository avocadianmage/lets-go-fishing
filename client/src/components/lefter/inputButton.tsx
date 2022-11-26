import { IconButtonProps, IconButton } from '@mui/material';

export const InputButton = (props: IconButtonProps) => {
    return (
        <IconButton {...props} edge='end' size='small' sx={{ ...props.sx, borderRadius: '4px' }}>
            {props.children}
        </IconButton>
    );
};
