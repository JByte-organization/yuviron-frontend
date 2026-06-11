import { useState, useEffect } from 'react';
import { DESKTOP_BREAKPOINT } from '../model/contexts';

/**
 * Повертає true якщо ширина вікна >= DESKTOP_BREAKPOINT (992px).
 * Оновлюється при ресайзі вікна.
 */
export const useIsDesktop = (): boolean => {
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const check = () => setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    return isDesktop;
};