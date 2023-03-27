import { RefObject, useEffect, useState } from 'react';

const useMousePosition = (nodeRef: RefObject<HTMLElement>) => {
    const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>();
    useEffect(() => {
        const updateMousePosition = (ev: MouseEvent) => {
            setMousePosition({ x: ev.clientX, y: ev.clientY });
        };
        const elem = nodeRef.current;
        elem?.addEventListener('mousemove', updateMousePosition);
        return () => elem?.removeEventListener('mousemove', updateMousePosition);
    }, [nodeRef]);
    return mousePosition;
};

export default useMousePosition;
