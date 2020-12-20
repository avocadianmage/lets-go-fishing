import React from 'react';
import { Card } from './card';

export const Library = ({ loading, topCard, onClick }) => {
    return (
        <div className="library gutter">
            {(loading || topCard) && 
                <Card info={topCard} faceDown={true} onClick={onClick} />
            }
        </div>
    );
}
