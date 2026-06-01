'use client';

import React from 'react';
import { Header } from '@/widgets/header/ui/Header';
import { Footer } from '@/widgets/footer/ui/Footer';
import { PlaylistToastProvider } from '@/shared/ui/PlaylistToast';
import { ArtistDashboardSidebar } from '@/widgets/artist-sidebar/ui/ArtistDashboardSidebar';

import { SidebarContext, RightSidebarContext } from '@/widgets/layout/model/contexts';
import { useState } from 'react';

interface ArtistDashboardLayoutProps {
    children: React.ReactNode;
}

export const ArtistDashboardLayout = ({ children }: ArtistDashboardLayoutProps) => {
    const [collapsed, setCollapsed] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(260);

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