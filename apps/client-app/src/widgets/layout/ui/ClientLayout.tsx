'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Header } from '@/widgets/header/ui/Header';
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar';
import { GuestSidebar } from '@/widgets/sidebar/ui/GuestSidebar';
import { useSessionStore } from '@/entities/session/model/store';
import { Footer } from '@/widgets/footer/ui/Footer';
import { RightSidebar } from '@/widgets/right-sidebar/ui/RightSidebar';
import { PlaylistToastProvider } from '@/shared/ui/PlaylistToast';
import { AuthGuardProvider } from '@/shared/lib/useAuthGuard';

// ══════════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════════
const SIDEBAR_MIN_WIDTH = 240;  // ~2 Bootstrap cols
const SIDEBAR_MAX_WIDTH = 480;  // ~4 Bootstrap cols
const SIDEBAR_DEFAULT   = 260;

// ══════════════════════════════════════════════════════════
// LEFT SIDEBAR CONTEXT
// ══════════════════════════════════════════════════════════
interface SidebarContextValue {
    collapsed:    boolean;
    setCollapsed: (v: boolean) => void;
    sidebarWidth: number;
}

export const SidebarContext = createContext<SidebarContextValue>({
    collapsed:    false,
    setCollapsed: () => {},
    sidebarWidth: SIDEBAR_DEFAULT,
});

export const useSidebar = () => useContext(SidebarContext);

// ══════════════════════════════════════════════════════════
// RIGHT SIDEBAR CONTEXT
// ══════════════════════════════════════════════════════════
interface RightSidebarContextValue {
    isOpen:    boolean;
    userClosed:boolean;
    open:  () => void;
    close: () => void;
}

export const RightSidebarContext = createContext<RightSidebarContextValue>({
    isOpen:     false,
    userClosed: false,
    open:  () => {},
    close: () => {},
});

export const useRightSidebar = () => useContext(RightSidebarContext);

// ══════════════════════════════════════════════════════════
// CLIENT LAYOUT
// ══════════════════════════════════════════════════════════
interface ClientLayoutProps {
    children: React.ReactNode;
}

export const ClientLayout = ({ children }: ClientLayoutProps) => {
    // ─── Лівий сайдбар ────────────────────────────────────
    const [collapsed,    setCollapsed]    = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT);

    // ─── Resize логіка ────────────────────────────────────
    const isResizing  = useRef(false);
    const startX      = useRef(0);
    const startWidth  = useRef(SIDEBAR_DEFAULT);

    const onResizeStart = useCallback((e: React.MouseEvent) => {
        isResizing.current = true;
        startX.current     = e.clientX;
        startWidth.current = sidebarWidth;

        const onMouseMove = (e: MouseEvent) => {
            if (!isResizing.current) return;
            const delta    = e.clientX - startX.current;
            const newWidth = Math.min(
                SIDEBAR_MAX_WIDTH,
                Math.max(SIDEBAR_MIN_WIDTH, startWidth.current + delta)
            );
            setSidebarWidth(newWidth);
        };

        const onMouseUp = () => {
            isResizing.current = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup',   onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup',   onMouseUp);
    }, [sidebarWidth]);

    // ─── Правий сайдбар ───────────────────────────────────
    const [isOpen,     setIsOpen]     = useState(false);
    const [userClosed, setUserClosed] = useState(false);

    const open = () => { if (!userClosed) setIsOpen(true); };
    const close = () => { setIsOpen(false); setUserClosed(true); };
    const openManually = () => { setUserClosed(false); setIsOpen(true); };

    const accessToken = useSessionStore(s => s.accessToken);

    return (
        <SidebarContext.Provider value={{ collapsed, setCollapsed, sidebarWidth }}>
            <RightSidebarContext.Provider value={{ isOpen, userClosed, open, close }}>
                <AuthGuardProvider>
                    <div className="client-layout">
                        <Header />

                        <div className="client-layout__body">
                            {/* Лівий сайдбар */}
                            {accessToken
                                ? <Sidebar onResizeStart={onResizeStart} />
                                : <GuestSidebar onResizeStart={onResizeStart} />
                            }

                            {/* Основний контент */}
                            <main
                                className={[
                                    'client-layout__main',
                                    collapsed ? 'client-layout__main--left-collapsed' : '',
                                    isOpen    ? 'client-layout__main--right-open'     : '',
                                ].filter(Boolean).join(' ')}
                                style={{
                                    marginLeft: collapsed ? 32 : sidebarWidth + 24,
                                    transition: isResizing.current ? 'none' : 'margin-left 0.3s ease',
                                }}
                            >
                                <PlaylistToastProvider>
                                    {children}
                                </PlaylistToastProvider>
                                <Footer />
                            </main>

                            {/* Правий сайдбар */}
                            <RightSidebar onOpenManually={openManually} />
                        </div>
                    </div>
                </AuthGuardProvider>
            </RightSidebarContext.Provider>
        </SidebarContext.Provider>
    );
};