import { RefObject, useEffect, useState } from "react";

export const useRect = (nodeRef: RefObject<HTMLElement>) => {
    const [rect, setRect] = useState<DOMRect>(new DOMRect());
    useEffect(() => {
        const updateRect = () => setRect(nodeRef.current!.getBoundingClientRect());
        window.addEventListener('resize', updateRect);
        updateRect();
        return () => window.removeEventListener('resize', updateRect);
    }, [nodeRef]);
    return rect;
};
