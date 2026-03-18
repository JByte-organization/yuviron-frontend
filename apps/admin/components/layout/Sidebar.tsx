// apps/admin/components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export const Sidebar = () => {
    const pathname = usePathname();
    const [elementsOpen, setElementsOpen] = useState(true);


    return (
        <aside className="admin-sidebar d-flex flex-column vh-100">
            {/* Header: Logo & Title */}
            <div className="sidebar-header d-flex align-items-center p-4">
                <div className="logo-icon me-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L14.5 9H21L15.5 13.5L18 21L12 16.5L6 21L8.5 13.5L3 9H9.5L12 2Z" fill="#40A2FF" />
                    </svg>
                </div>
                <p className="m-0 fw-medium text-white h4 text-center">Admin Dashboard</p>
            </div>

            {/* Action Button */}
            <div className="px-3 mb-4">
                <button className="btn btn-new-item w-100 py-2 fw-bold text-dark">
                    <span className="me-2">+</span> New Item
                </button>
            </div>

            {/* Navigation Menu */}
            <nav className="sidebar-nav flex-grow-1 overflow-auto">
                <ul className="list-unstyled">
                    <li><Link href="/users" className={`nav-link ${pathname === '/users' ? 'active' : ''}`}>Users</Link></li>
                    <li><Link href="/artists" className={`nav-link ${pathname === '/artists' ? 'active' : ''}`}>Artists</Link></li>
                    <li><Link href="/dashboard" className={`nav-link ${pathname === '/dashboard' ? 'active' : ''}`}>Dashboard</Link></li>

                    {/* Accordion Elements */}
                    <li className="nav-group">
                        <div
                            className="nav-link d-flex justify-content-between align-items-center cursor-pointer"
                            onClick={() => setElementsOpen(!elementsOpen)}
                        >
                            <span>Elements</span>
                            <span className={`chevron ${elementsOpen ? 'open' : ''}`}>▲</span>
                        </div>

                        {elementsOpen && (
                            <ul className="list-unstyled ps-4 submenu">
                                <li><Link href="/tracks" className={`nav-link ${pathname === '/tracks' ? 'active' : ''}`}>Tracks</Link></li>
                                <li><Link href="/playlists" className="nav-link">Playlists</Link></li>
                                <li><Link href="/albums" className="nav-link">Albums</Link></li>
                                <li><Link href="/genres" className="nav-link">Genres</Link></li>
                                <li><Link href="/moods" className="nav-link">Moods</Link></li>
                            </ul>
                        )}
                    </li>

                    <li><Link href="/settings" className="nav-link">Settings</Link></li>
                </ul>
            </nav>

            {/* Footer: Exit */}
            <div className="sidebar-footer p-3 border-top border-secondary">
                <button className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center">
                    <span className="me-2">⇥</span> Exit
                </button>
            </div>
        </aside>
    );
};