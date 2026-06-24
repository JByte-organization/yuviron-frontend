'use client';

import React from 'react';
import { Header } from '@/widgets/header/ui/Header';
import { Footer } from '@/widgets/footer/ui/Footer';
import { PlaylistToastProvider } from '@/shared/ui/PlaylistToast';
import { ArtistDashboardSidebar } from '@/widgets/artist-sidebar/ui/ArtistDashboardSidebar';
import { ArtistGateScreen } from './ArtistGateScreen';

import { SidebarContext, RightSidebarContext } from '@/widgets/layout/model/contexts';
import { useState } from 'react';
import { useCurrentArtist } from '@/entities/artist/model/currentArtist';
import { useSessionStore } from '@/entities/session/model/store';

interface ArtistDashboardLayoutProps {
    children: React.ReactNode;
}

export const ArtistDashboardLayout = ({ children }: ArtistDashboardLayoutProps) => {
    const [collapsed, setCollapsed] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(260);

    const { artistId, isResolving, canManage } = useCurrentArtist();
    const authResolved = useSessionStore((s) => s.authResolved);

    if (!authResolved || isResolving) return <ArtistGateScreen loading />;

    if (!artistId) return <ArtistGateScreen />;

    return (
            <SidebarContext.Provider value={{ collapsed, setCollapsed, sidebarWidth }}>
                <RightSidebarContext.Provider value={{
                    isOpen: false,
                    userClosed: false,
                    open: () => {},
                    close: () => {},
                }}>
                    <div className="client-layout">
                        <Header />

                        <div className="client-layout__body">
                            {/* Сайдбар артиста */}
                            <ArtistDashboardSidebar />

                            {/* Основний контент */}
                            <main className={[
                                'client-layout__main',
                                collapsed ? 'client-layout__main--left-collapsed' : '',
                            ].filter(Boolean).join(' ')}>
                                {!canManage && (
                                    <div className="artist-readonly-banner">
                                        <i className="bi bi-eye" />
                                        Режим перегляду — у вас немає прав на редагування цього кабінету.
                                    </div>
                                )}
                                <PlaylistToastProvider>
                                    {children}
                                </PlaylistToastProvider>
                                <Footer />
                            </main>
                        </div>
                    </div>
                </RightSidebarContext.Provider>
            </SidebarContext.Provider>
    );
};