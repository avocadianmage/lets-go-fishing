import { Tooltip, Link, ButtonProps, Button } from '@mui/material';

export interface InputButtonProps extends ButtonProps {
    tooltip?: string;
    link?: string;
}

export const InputButton = (props: InputButtonProps) => {
    const Clickable = (
        <a href={props.link} target='_blank'>
            <Button
                aria-label={props.tooltip}
                {...props}
                sx={{ minWidth: 0, height: '100%', color: 'var(--nord4)', p: '6px', ...props.sx }}
            >
                {props.children}
            </Button>
        </a>
    );

    return props.disabled ? (
        Clickable
    ) : (
        <Tooltip title={props.tooltip} disableInteractive>
            {Clickable}
        </Tooltip>
    );
};
