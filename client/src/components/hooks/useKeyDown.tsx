import { useCallback, useEffect } from 'react';

export const useGlobalShortcuts = (
    shortcutMap: {
        [shortcut: string]: (e: KeyboardEvent) => void;
    },
    validator: () => boolean = () => true
) => {
    const handler = useCallback(
        (e: KeyboardEvent) => {
            const action = shortcutMap[e.key];
            const noInputFocus = document.activeElement!.tagName !== 'INPUT';
            if (action && noInputFocus && validator()) action(e);
        },
        [shortcutMap, validator]
    );

    useEffect(() => {
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [handler]);
};
