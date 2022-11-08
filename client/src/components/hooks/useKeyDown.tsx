import { useCallback, useEffect } from 'react';

export const useGlobalShortcuts = (
    shortcutMap: {
        [shortcut: string]: (e: KeyboardEvent) => void;
    },
    validator: () => boolean
) => {
    const handler = useCallback(
        (e: KeyboardEvent) => {
            const action = shortcutMap[e.key];
            const noControlFocus = document.activeElement!.tagName === 'BODY';
            if (action && noControlFocus && validator()) action(e);
        },
        [shortcutMap, validator]
    );

    useEffect(() => {
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [handler]);
};
