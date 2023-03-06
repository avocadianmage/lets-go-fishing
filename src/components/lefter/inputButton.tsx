import { IconButtonProps, IconButton, Tooltip, Link } from '@mui/material';

export interface InputButtonProps extends IconButtonProps {
    tooltip?: string;
    link?: string;
}

export const InputButton = (props: InputButtonProps) => {
    return (
        <Tooltip title={props.tooltip}>
            <Link href={props.link} target='_blank'>
                <IconButton
                    {...props}
                    edge='end'
                    size='small'
                    sx={{ ...props.sx, borderRadius: '4px' }}
                >
                    {props.children}
                </IconButton>
            </Link>
        </Tooltip>
    );
};
