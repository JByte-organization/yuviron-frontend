'use client';

import { useEffect, useRef, useState, type DependencyList } from 'react';

export const useHasOverflow = <T extends HTMLElement>(deps: DependencyList = []) => {
    const ref = useRef<T>(null);
    const [hasOverflow, setHasOverflow] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const measure = () => setHasOverflow(el.scrollWidth - el.clientWidth > 1);
        const observer = new ResizeObserver(measure);
        observer.observe(el);
        window.addEventListener('resize', measure);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', measure);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return [ref, hasOverflow] as const;
};
