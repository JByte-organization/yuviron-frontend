'use client';

import React, { useState } from 'react';
import { Header } from '@/widgets/header/ui/Header';
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar';
import { GuestSidebar } from '@/widgets/sidebar/ui/GuestSidebar';
import { useSessionStore, selectIsAuthenticated } from '@/entities/session/model/store';
import { Footer } from '@/widgets/footer/ui/Footer';
import { RightSidebar } from '@/widgets/right-sidebar/ui/RightSidebar';
import { PlaylistToastProvider } from '@/shared/ui/PlaylistToast';
import { AuthGuardProvider } from '@/shared/lib/useAuthGuard';
import { PlayerBar } from '@/widgets/player/ui/PlayerBar';

import {
    SidebarContext,
    RightSidebarContext,
    SIDEBAR_ICON_WIDTH,
} from '../model/contexts';
import { useSidebarResize } from '../lib/useSidebarResize';
import { useRightSidebarState } from '../lib/useRightSidebarState';
import { useIsDesktop } from '../lib/useIsDesktop';

interface ClientLayoutProps {
    children: React.ReactNode;
}

export const ClientLayout = ({ children }: ClientLayoutProps) => {
    const isDesktop = useIsDesktop();

    // ─── Лівий сайдбар ────────────────────────────────────
    const [collapsed, setCollapsed] = useState(false);
    const { sidebarWidth, isResizing, onResizeStart } = useSidebarResize();

    // ─── Правий сайдбар ───────────────────────────────────
    const { isOpen, userClosed, open, close, openManually } = useRightSidebarState();

    // Каркас рендеримо за статусом, а не за наявністю токена «прямо зараз»:
    // під час refresh токена ще нема, але показувати гостьовий UI не можна.
    const status = useSessionStore(s => s.status);
    const isAuthenticated = useSessionStore(selectIsAuthenticated);

    // На мобайлі marginLeft = 0, сайдбар display:none через CSS
    const marginLeft = !isDesktop
        ? 0
        : collapsed
            ? SIDEBAR_ICON_WIDTH + 16
            : sidebarWidth + 24;

    return (
        <SidebarContext.Provider value={{ collapsed, setCollapsed, sidebarWidth }}>
            <RightSidebarContext.Provider value={{ isOpen, userClosed, open, close }}>
                <AuthGuardProvider>
                    <div className="client-layout">
                        <Header />

                        <div className="client-layout__body">
                            {status === 'loading'
                                ? null
                                : isAuthenticated
                                    ? <Sidebar onResizeStart={onResizeStart} />
                                    : <GuestSidebar onResizeStart={onResizeStart} />
                            }

                            <main
                                className={[
                                    'client-layout__main',
                                    isOpen ? 'client-layout__main--right-open' : '',
                                ].filter(Boolean).join(' ')}
                                style={{
                                    marginLeft,
                                    transition: isResizing.current ? 'none' : 'margin-left 0.3s ease',
                                }}
                            >
                                <PlaylistToastProvider>
                                    {children}
                                </PlaylistToastProvider>
                                <Footer />
                            </main>

                            <RightSidebar onOpenManually={openManually} />
                        </div>

                        <PlayerBar />
                    </div>
                </AuthGuardProvider>
            </RightSidebarContext.Provider>
        </SidebarContext.Provider>
    );
};