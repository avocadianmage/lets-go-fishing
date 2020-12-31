import React from 'react';
import { CardInfo } from '../services/dbSvc';
import { Card } from './card';
import { Zone } from './gameLayout';

interface LibraryProps {
    loading?: boolean;
    topCard?: CardInfo;
    onClick(): void;
}

export const Library = ({ loading, topCard, onClick }: LibraryProps) => {
    return (
        <div id={Zone.Library} className='zone'>
            {(loading || topCard) && 
                <Card 
                    info={topCard} 
                    faceDown={true} 
                    onClick={onClick} 
                    onDragStart={() => false}
                    onDragStop={() => false}
                />
            }
        </div>
    );
}
