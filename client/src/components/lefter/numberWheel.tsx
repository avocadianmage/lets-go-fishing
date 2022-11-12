import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material';
import { Button, ButtonGroup } from '@mui/material';
import { useState } from 'react';
import { useGlobalShortcuts } from '../hooks/useKeyDown';

interface NumberWheelProps {
    label: string;
    icon: JSX.Element;
    defaultCount?: number;
    min?: number;
    max?: number;
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
    defaultCount = 0,
    min = Number.MIN_SAFE_INTEGER,
    max = Number.MAX_SAFE_INTEGER,
}: NumberWheelProps) => {
    const [count, setCount] = useState<number>(defaultCount);

    const increment = (step: number) => setCount(Math.max(min, Math.min(max, count + step)));
    const reset = () => setCount(defaultCount);
    
    const buttonProps = {
        className: 'removeMuiButtonGroupBorder',
        onWheel: (e: React.WheelEvent<HTMLButtonElement>) => increment(-Math.sign(e.deltaY)),
    };

    useGlobalShortcuts({
        r: reset,
    });

    return (
        <ButtonGroup orientation='vertical' aria-label={label} sx={{ flex: 1 }}>
            <Button
                {...buttonProps}
                aria-label='increment'
                sx={{ p: '2px 0px 10px 0px' }}
                onClick={() => increment(1)}
            >
                <ButtonHalf item1={<ArrowDropUp />} item2={icon} />
            </Button>
            <Button
                {...buttonProps}
                aria-label='decrement'
                sx={{ p: '4px 0px 2px 0px' }}
                onClick={() => increment(-1)}
            >
                <ButtonHalf
                    item1={
                        <code
                            style={{
                                fontSize: '1.2em',
                                fontWeight: 'bold',
                                color: count === defaultCount ? 'rgba(255, 255, 255, 0.5)' : '#fff',
                            }}
                        >
                            {count}
                        </code>
                    }
                    item2={<ArrowDropDown />}
                />
            </Button>
        </ButtonGroup>
    );
};
