import { useState, useCallback, useRef } from 'react';
import { SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH, SIDEBAR_DEFAULT } from '../model/contexts';

interface UseSidebarResizeReturn {
    sidebarWidth:  number;
    isResizing:    React.MutableRefObject<boolean>;
    onResizeStart: (e: React.MouseEvent) => void;
}

export const useSidebarResize = (): UseSidebarResizeReturn => {
    const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT);

    const isResizing = useRef(false);
    const startX     = useRef(0);
    const startWidth = useRef(SIDEBAR_DEFAULT);

    const onResizeStart = useCallback((e: React.MouseEvent) => {
        isResizing.current = true;
        startX.current     = e.clientX;
        startWidth.current = sidebarWidth;

        // Забороняємо виділення тексту і ставимо курсор ресайзу по всьому документу
        document.body.style.userSelect = 'none';
        document.body.style.cursor     = 'ew-resize';

        const onMouseMove = (e: MouseEvent) => {
            if (!isResizing.current) return;
            const delta    = e.clientX - startX.current;
            const newWidth = Math.min(
                SIDEBAR_MAX_WIDTH,
                Math.max(SIDEBAR_MIN_WIDTH, startWidth.current + delta),
            );
            setSidebarWidth(newWidth);
        };

        const onMouseUp = () => {
            isResizing.current = false;
            document.body.style.userSelect = '';
            document.body.style.cursor     = '';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup',   onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup',   onMouseUp);
    }, [sidebarWidth]);

    return { sidebarWidth, isResizing, onResizeStart };
};