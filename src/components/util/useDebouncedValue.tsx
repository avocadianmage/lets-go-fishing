import debounce from 'lodash/debounce';
import { useMemo, useState } from 'react';

export function useDebouncedValue<T>(
    initialValue: T | undefined,
    wait: number
): [T | undefined, (_: T | undefined) => void] {
    const [debouncedValue, setDebouncedValue] = useState(initialValue);
    const debouncedFunction = useMemo(
        () => debounce(setDebouncedValue, wait, { leading: true }),
        [wait]
    );
    return [debouncedValue, debouncedFunction];
}
