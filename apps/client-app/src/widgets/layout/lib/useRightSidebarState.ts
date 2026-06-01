import { useState } from 'react';

interface UseRightSidebarReturn {
    isOpen:        boolean;
    userClosed:    boolean;
    open:          () => void;
    close:         () => void;
    openManually:  () => void;
}

/**
 * Хук стану правого сайдбара.
 * userClosed — флаг що юзер явно закрив сайдбар,
 * щоб не відкривати його автоматично знову.
 */
export const useRightSidebarState = (): UseRightSidebarReturn => {
    const [isOpen,     setIsOpen]     = useState(false);
    const [userClosed, setUserClosed] = useState(false);

    const open        = () => { if (!userClosed) setIsOpen(true); };
    const close       = () => { setIsOpen(false); setUserClosed(true); };
    const openManually = () => { setUserClosed(false); setIsOpen(true); };

    return { isOpen, userClosed, open, close, openManually };
};