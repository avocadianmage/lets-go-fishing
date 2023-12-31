import { useCallback, useEffect } from 'react';

export const useGlobalShortcuts = (
    shortcutMap: {
        [shortcut: string]: (e: KeyboardEvent) => void;
    },
    validator: () => boolean = () => true
) => {
    const handler = useCallback(
        (e: KeyboardEvent) => {
            const action = shortcutMap[e.key.toLowerCase()] ?? shortcutMap[e.key.toUpperCase()];
            if (e.ctrlKey || e.altKey || !action || !validator()) return;
            
            const noInputFocus = document.activeElement!.tagName !== 'INPUT';
            if (noInputFocus) action(e);
        },
        [shortcutMap, validator]
    );

    useEffect(() => {
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [handler]);
};
