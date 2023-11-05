import { TextField, TextFieldProps, styled } from '@mui/material';

export const StyledTextField = styled(TextField)<TextFieldProps>(() => ({
    flex: 1,
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: 'transparent',
        },
        '&.Mui-disabled fieldset': {
            border: '0px',
        },
    },
}));
