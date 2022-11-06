import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material';
import { Button, ButtonGroup, Divider } from '@mui/material';
import { grey } from '@mui/material/colors';
import React, { useState } from 'react';

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
        <ButtonGroup
            orientation='vertical'
            aria-label={label}
            sx={{ m: '0px 4px 0px 4px', backgroundColor: grey[900] }}
        >
            <Button
                variant='text'
                aria-label='increment'
                sx={{ paddingTop: '2px', paddingBottom: '8px' }}
                onClick={() => setCount(count + 1)}
            >
                <ButtonHalf item1={<ArrowDropUp />} item2={icon} />
            </Button>
            <Divider />
            <Button
                variant='text'
                aria-label='decrement'
                sx={{ paddingTop: '4px', paddingBottom: '2px' }}
                onClick={() => setCount(count - 1)}
            >
                <ButtonHalf
                    item1={<React.Fragment>{count}</React.Fragment>}
                    item2={<ArrowDropDown />}
                />
            </Button>
        </ButtonGroup>
    );
};
