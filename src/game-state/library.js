import React from 'react';
import { Card } from './card';

export const Library = ({ loading, topCard, onClick }) => {
    return (
        <div className="library zone">
            {(loading || topCard) && 
                <Card info={topCard} faceDown={true} onClick={onClick} />
            }
        </div>
    );
}
