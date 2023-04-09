import { Tooltip, Link, ButtonProps, Button } from '@mui/material';

export interface InputButtonProps extends ButtonProps {
    tooltip?: string;
    link?: string;
}

export const InputButton = (props: InputButtonProps) => {
    const Clickable = (
        <Button
            aria-label={props.tooltip}
            {...props}
            sx={{ color: 'var(--nord4)', minWidth: 0, ...props.sx }}
        >
            <Link href={props.link} target='_blank' sx={{ height: '24px', color: 'inherit' }}>
                {props.children}
            </Link>
        </Button>
    );

    return props.disabled ? Clickable : <Tooltip title={props.tooltip}>{Clickable}</Tooltip>;
};
