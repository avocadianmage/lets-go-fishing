import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material';
import { Button, ButtonGroup } from '@mui/material';
import { useState } from 'react';

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

    const increment = () => setCount(Math.min(max, count + 1));
    const decrement = () => setCount(Math.max(min, count - 1));

    return (
        <ButtonGroup orientation='vertical' aria-label={label} sx={{ flex: 1 }}>
            <Button
                aria-label='increment'
                sx={{ p: '2px 0px 10px 0px' }}
                className='removeMuiButtonGroupBorder'
                onClick={increment}
            >
                <ButtonHalf item1={<ArrowDropUp />} item2={icon} />
            </Button>
            <Button
                aria-label='decrement'
                sx={{ p: '4px 0px 2px 0px' }}
                className='removeMuiButtonGroupBorder'
                onClick={decrement}
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
