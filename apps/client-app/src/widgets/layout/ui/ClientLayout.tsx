'use client';

import React, { createContext, useContext, useState } from 'react';
import { Header } from '@/widgets/header/ui/Header';
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar';
import { GuestSidebar } from '@/widgets/sidebar/ui/GuestSidebar';
import { useSessionStore } from '@/entities/session/model/store';
import { Footer } from '@/widgets/footer/ui/Footer';
import { RightSidebar } from '@/widgets/right-sidebar/ui/RightSidebar';
import { PlaylistToastProvider } from '@/shared/ui/PlaylistToast';
import { AuthGuardProvider } from '@/shared/lib/useAuthGuard';

// ══════════════════════════════════════════════════════════
// LEFT SIDEBAR CONTEXT
// ══════════════════════════════════════════════════════════
interface SidebarContextValue {
    collapsed: boolean;
    setCollapsed: (v: boolean) => void;
}

export const SidebarContext = createContext<SidebarContextValue>({
    collapsed: false,
    setCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

// ══════════════════════════════════════════════════════════
// RIGHT SIDEBAR CONTEXT
// ══════════════════════════════════════════════════════════
interface RightSidebarContextValue {
    isOpen: boolean;
    userClosed: boolean;
    open: () => void;
    close: () => void;
}

export const RightSidebarContext = createContext<RightSidebarContextValue>({
    isOpen: false,
    userClosed: false,
    open: () => {},
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
    const [collapsed, setCollapsed] = useState(false);

    // ─── Правий сайдбар ───────────────────────────────────
    const [isOpen,    setIsOpen]    = useState(false);
    const [userClosed,setUserClosed]= useState(false);

    const open = () => {
        if (!userClosed) setIsOpen(true);
    };

    const close = () => {
        setIsOpen(false);
        setUserClosed(true);
    };

    const openManually = () => {
        setUserClosed(false);
        setIsOpen(true);
    };

    const accessToken = useSessionStore(s => s.accessToken);

    return (
        <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
            <RightSidebarContext.Provider value={{ isOpen, userClosed, open, close }}>
                <AuthGuardProvider>
                    <div className="client-layout">
                        <Header />

                        <div className="client-layout__body">
                            {/* Лівий сайдбар */}
                            {accessToken ? <Sidebar /> : <GuestSidebar />}

                            {/* Основний контент */}
                            <main className={[
                                'client-layout__main',
                                collapsed ? 'client-layout__main--left-collapsed' : '',
                                isOpen    ? 'client-layout__main--right-open'     : '',
                            ].filter(Boolean).join(' ')}>
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