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
    const contentShift = useMemo(() => (sidebarOpen && isDesktop ? SIDEBAR_WIDTH : 0), [sidebarOpen, isDesktop]);

    const handleOverlayKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
            setSidebarOpen(false);
        }
    }, []);

    return (
        <div className="admin-layout">

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
                    marginLeft: contentShift,
                    transition: 'margin-left 0.25s ease',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <AdminHeader onMenuToggle={handleToggle} />

                <main className="flex-grow-1">
                    <div className="container-fluid p-3 p-md-4">
                        <div className="admin-secondary rounded-3 p-3">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
