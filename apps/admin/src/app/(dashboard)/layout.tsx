'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/widgets/sidebar';
import { AdminHeader } from '@/widgets/header';
import "@repo/ui/styles";

const SIDEBAR_WIDTH = 260;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    // На десктопе открыт по умолчанию, на мобиле — закрыт
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const check = () => {
            const desktop = window.innerWidth >= 992;
            setIsDesktop(desktop);
            // При первом рендере открываем на десктопе
            if (desktop) setSidebarOpen(true);
        };
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    const showOverlay = sidebarOpen && !isDesktop;
    const contentShift = sidebarOpen && isDesktop ? SIDEBAR_WIDTH : 0;

    return (
        <div className="admin-layout" style={{ minHeight: '100vh', backgroundColor: '#151921' }}>

            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Overlay — только мобил */}
            {showOverlay && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        zIndex: 1040,
                    }}
                />
            )}

            {/* Контент */}
            <div
                style={{
                    marginLeft: contentShift,
                    transition: 'margin-left 0.25s ease',
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <AdminHeader onMenuToggle={() => setSidebarOpen(o => !o)} />

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