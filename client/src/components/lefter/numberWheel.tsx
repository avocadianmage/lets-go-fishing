import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material';
import { Button, ButtonGroup, Divider } from '@mui/material';
import { grey } from '@mui/material/colors';
import { useState } from 'react';

interface NumberWheelProps {
    label: string;
    icon: JSX.Element;
    defaultCount?: number;
}

const sizeStyle = { width: '24px', height: '24px' };
const ButtonHalf = ({ item1, item2 }: { item1: JSX.Element; item2: JSX.Element }) => (
    <div style={{ display: 'block ' }}>
        <div style={sizeStyle}>{item1}</div>
        <div style={sizeStyle}>{item2}</div>
    </div>
);

export const NumberWheel = ({ label, icon, defaultCount }: NumberWheelProps) => {
    const [count, setCount] = useState<number>(defaultCount ?? 0);

    return (
        <ButtonGroup orientation='vertical' aria-label={label} sx={{ flex: 1 }}>
            <Button
                aria-label='increment'
                sx={{ p: '2px 0px 8px 0px' }}
                onClick={() => setCount(count + 1)}
            >
                <ButtonHalf item1={<ArrowDropUp />} item2={icon} />
            </Button>
            <Divider />
            <Button
                aria-label='decrement'
                sx={{ p: '4px 0px 2px 0px' }}
                onClick={() => setCount(count - 1)}
            >
                <ButtonHalf
                    item1={
                        <code
                            style={{ fontSize: '1.2em', fontWeight: 'bold', color: 'var(--nord4)' }}
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