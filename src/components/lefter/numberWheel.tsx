import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material';
import { Button, ButtonGroup, ButtonProps } from '@mui/material';
import { CSSProperties } from 'react';

interface NumberWheelProps {
    label: string;
    icon: JSX.Element;
    count: number;
    updateCount(newCount: number): void;
    min?: number;
    max?: number;
    defaultCount?: number;
}

const sizeStyle = { width: '24px', height: '24px' };
const ButtonHalf = ({ item1, item2 }: { item1: JSX.Element; item2: JSX.Element }) => (
    <div style={{ display: 'block ' }}>
        <div style={sizeStyle}>{item1}</div>
        <div style={sizeStyle}>{item2}</div>
    </div>
);

export const NumberWheel = ({
    label,
    icon,
    count,
    updateCount,
    min = Number.MIN_SAFE_INTEGER,
    max = Number.MAX_SAFE_INTEGER,
    defaultCount = 0,
}: NumberWheelProps) => {
    const increment = (step: number) => updateCount(Math.max(min, Math.min(max, count + step)));

    const buttonProps: ButtonProps = {
        sx: { borderStyle: 'none !important' },
        onWheel: (e: React.WheelEvent<HTMLButtonElement>) => increment(-Math.sign(e.deltaY)),
    };
    const numberTextProps: CSSProperties = {
        fontSize: '1.2em',
        fontWeight: 'bold',
        color: count === defaultCount ? 'rgba(255, 255, 255, 0.5)' : '#fff',
    };

    return (
        <ButtonGroup orientation='vertical' aria-label={label} sx={{ flex: 1 }}>
            <Button
                {...buttonProps}
                aria-label='increment'
                sx={{ ...buttonProps.sx, p: '2px 0px 10px 0px' }}
                onClick={() => increment(1)}
            >
                <ButtonHalf item1={<ArrowDropUp />} item2={icon} />
            </Button>
            <Button
                {...buttonProps}
                aria-label='decrement'
                sx={{ ...buttonProps.sx, p: '4px 0px 2px 0px' }}
                onClick={() => increment(-1)}
            >
                <ButtonHalf
                    item1={<span style={numberTextProps}>{count}</span>}
                    item2={<ArrowDropDown />}
                />
            </Button>
        </ButtonGroup>
    );
};
