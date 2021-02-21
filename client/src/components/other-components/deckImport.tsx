import './flatButton.css';
import { MouseEventHandler } from "react";

interface DeckImportProps {
    disabled: boolean;
    onClick: MouseEventHandler<HTMLButtonElement>;
}

export const DeckImport = ({ disabled, onClick }: DeckImportProps) => {
    return (
        <button className="flatButton" disabled={disabled} onClick={onClick} />
    );
};
