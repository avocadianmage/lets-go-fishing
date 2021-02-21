import { useState } from 'react';
import './css/lefter.css';

interface LefterProps {
    onImport(importValue: string): void;
}

export const Lefter = ({ onImport }: LefterProps) => {
    const [importValue, setImportValue] = useState('');

    const fireKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        switch (e.key) {
            case 'Enter':
                onImport(importValue);
                break;
            case 'Escape':
                setImportValue('');
                break;
        }
    };

    return (
        <div id='lefter' className='pane'>
            <input 
                className='textfield' 
                type='text' 
                placeholder='Enter Moxfield deck address'
                value={importValue}
                onChange={(e) => setImportValue(e.target.value)}
                onKeyDown={fireKeyDown}
            />
        </div>
    );
};
