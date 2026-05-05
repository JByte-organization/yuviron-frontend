'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const SIDEBAR_WIDTH = 260;

export const Sidebar = ({ isOpen, onClose }: Props) => {
    const pathname = usePathname();
    const [elementsOpen, setElementsOpen] = useState(true);

    // Закрываем на мобиле при переходе
    useEffect(() => {
        if (window.innerWidth < 992) {
            onClose();
        }
    }, [pathname]);

    const navLink = (href: string, label: string) => (
        <li key={href}>
            <Link
                href={href}
                className={`nav-link ${pathname === href ? 'active' : ''}`}
            >
                {label}
            </Link>
        </li>
    );

    return (
        <aside
            className="admin-sidebar d-flex flex-column"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                height: '100vh',
                width: `${SIDEBAR_WIDTH}px`,
                zIndex: 1045,
                transform: isOpen ? 'translateX(0)' : `translateX(-${SIDEBAR_WIDTH}px)`,
                transition: 'transform 0.25s ease',
                overflowY: 'auto',
            }}
        >
            {/* Header */}
            <div className="sidebar-header d-flex align-items-center justify-content-between p-4">
                <div className="d-flex align-items-center gap-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L14.5 9H21L15.5 13.5L18 21L12 16.5L6 21L8.5 13.5L3 9H9.5L12 2Z" fill="#40A2FF" />
                    </svg>
                    <p className="m-0 fw-medium text-white h6 mb-0">Admin Dashboard</p>
                </div>
                <button
                    className="btn btn-sm btn-outline-secondary border-0"
                    onClick={onClose}
                    title="Close sidebar"
                >
                    ✕
                </button>
            </div>

            {/* Nav */}
            <nav className="sidebar-nav flex-grow-1">
                <ul className="list-unstyled">
                    {navLink('/dashboard', 'Dashboard')}
                    {navLink('/users',     'Users')}
                    {navLink('/artists',   'Artists')}

                    <li className="nav-group">
                        <div
                            className="nav-link d-flex justify-content-between align-items-center"
                            style={{ cursor: 'pointer' }}
                            onClick={() => setElementsOpen(o => !o)}
                        >
                            <span>Elements</span>
                            <span style={{
                                display: 'inline-block',
                                transform: elementsOpen ? 'rotate(0deg)' : 'rotate(180deg)',
                                transition: 'transform 0.2s',
                                fontSize: '0.7rem',
                            }}>▲</span>
                        </div>

                        {elementsOpen && (
                            <ul className="list-unstyled ps-4 submenu">
                                {navLink('/tracks',    'Tracks')}
                                {navLink('/albums',    'Albums')}
                                {navLink('/genres',    'Genres')}
                                {navLink('/moods',     'Moods')}
                                {navLink('/playlists', 'Playlists')}
                            </ul>
                        )}
                    </li>

                    {navLink('/settings', 'Settings')}
                </ul>
            </nav>

            {/* Footer */}
            <div className="sidebar-footer p-3 border-top border-secondary">
                <button className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2">
                    <span>⇥</span> Exit
                </button>
            </div>
        </aside>
    );
};