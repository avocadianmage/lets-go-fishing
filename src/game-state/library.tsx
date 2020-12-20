import React, { FunctionComponent } from 'react';
import { Card } from './card';

export interface ILibraryProps {
    loading: any;
    topCard: any;
    onClick(): void;
}

export const Library: FunctionComponent<ILibraryProps> = ({ loading, topCard, onClick }) => {
    return (
        <div className="library gutter">
            {(loading || topCard) && 
                <Card info={topCard} faceDown={true} onClick={onClick} />
            }
        </div>
    );
}
