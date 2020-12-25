import React from 'react';
import { CardInfo } from '../services/dbSvc';
import { Card } from './card';

interface LibraryProps {
    loading?: boolean;
    topCard?: CardInfo;
    onClick(): void;
}

export const Library = ({ loading, topCard, onClick }: LibraryProps) => {
    return (
        <div className="library zone">
            {(loading || topCard) && 
                <Card 
                    info={topCard} 
                    faceDown={true} 
                    onClick={onClick} 
                    onDragStart={() => {}}
                    onDragStop={() => {}}
                />
            }
        </div>
    );
}
