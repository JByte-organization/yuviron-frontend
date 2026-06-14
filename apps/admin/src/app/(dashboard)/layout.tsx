'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Sidebar } from '@/widgets/sidebar';
import { AdminHeader } from '@/widgets/header';
import { SIDEBAR_WIDTH } from '@/shared/config/constants';
import "@repo/ui/styles";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        import('bootstrap');
    }, []);

    useEffect(() => {
        const check = () => {
            const desktop = window.innerWidth >= 992;
            setIsDesktop(prev => (prev === desktop ? prev : desktop));
            setSidebarOpen(prev => (desktop ? true : prev));
        };
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    const handleClose = useCallback(() => setSidebarOpen(false), []);
    const handleToggle = useCallback(() => setSidebarOpen(o => !o), []);

    const showOverlay = useMemo(() => sidebarOpen && !isDesktop, [sidebarOpen, isDesktop]);

    // Зсув контенту робимо ТІЛЬКИ на десктопі, якщо сайдбар відкритий
    const contentShift = useMemo(() => (sidebarOpen && isDesktop ? SIDEBAR_WIDTH : 0), [sidebarOpen, isDesktop]);

    const handleOverlayKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
            setSidebarOpen(false);
        }
    }, []);

    return (
        <div className="admin-layout" style={{ minHeight: '100vh', backgroundColor: '#121212', overflowX: 'hidden' }}>
            <Sidebar
                isOpen={sidebarOpen}
                onClose={handleClose}
            />

            {showOverlay && (
                <div
                    role="button"
                    aria-label="Закрыть боковую панель"
                    tabIndex={0}
                    onClick={handleClose}
                    onKeyDown={handleOverlayKeyDown}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        zIndex: 1040,
                    }}
                />
            )}

            <div
                style={{
                    marginLeft: `${contentShift}px`,
                    transition: 'margin-left 0.25s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh',
                }}
            >
                <AdminHeader
                    onMenuToggle={handleToggle}
                    sidebarOpen={sidebarOpen}
                    isDesktop={isDesktop}
                />

                {/* Головний контент */}
                <main className="grow" style={{ paddingTop: '80px' }}>
                    <div className="container-fluid p-2 p-md-4">
                        <div className="admin-secondary rounded-3 p-3">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}