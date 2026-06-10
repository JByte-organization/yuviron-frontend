'use client';

import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { useAdminSessionStore } from '@/entities/adminSession/model/store';
import Image from "next/image";
import Link from 'next/link';
import { SIDEBAR_WIDTH } from '@/shared/config/constants';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}


export const Sidebar = ({ isOpen, onClose }: Props) => {
    const pathname = usePathname();
    const [elementsOpen, setElementsOpen] = useState(true);

    const router = useRouter();
    const clearAdminSession = useAdminSessionStore((state) => state.clearAdminSession);

    const handleLogout = async () => {
        try {
            await fetch('https://dev-api.yuviron.com/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    Authorization: `Bearer ${useAdminSessionStore.getState().adminAccessToken}`,
                },
            });
        } catch {}

        document.cookie = 'adminToken=; path=/; max-age=0; SameSite=Strict';
        clearAdminSession();
        router.replace('/login');
    };

    useEffect(() => {
        if (window.innerWidth < 992) {
            onClose();
        }
    }, [pathname, onClose])

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
            <div className="sidebar-header d-flex align-items-center justify-content-between justify-content-lg-start p-3">
                <div className="d-flex align-items-center gap-2 justify-content-center">
                    <Image
                        src="/images/logo/logo-element.svg"
                        width={50}
                        height={40}
                        alt="logo"
                    />
                    <p className="m-0 fw-medium text-white h5 mb-0">Admin Dashboard</p>
                </div>
                <button
                    className="btn btn-sm btn-outline-secondary border-0 d-flex d-lg-none"
                    onClick={onClose}
                    title="Close sidebar"
                >
                    <Image
                        src="/images/icons/delete-btn.svg"
                        width={16}
                        height={16}
                        alt="close"
                    />
                </button>
            </div>

            {/* Nav */}
            <nav className="sidebar-nav flex-grow-1">
                <ul className="list-unstyled">
                    {navLink('/dashboard', 'Dashboard')}
                    {navLink('/users',     'Users')}
                    {navLink('/artists',   'Artists')}
                    {navLink('/verification', 'Verification')}
                    {navLink('/payout', 'Finance')}
                    {navLink('/ads', 'Ads')}

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
                                {navLink('/banners',    'Banners')}
                                {navLink('/tracks',    'Tracks')}
                                {navLink('/albums',    'Albums')}
                                {navLink('/genres',    'Genres')}
                                {navLink('/moods',     'Moods')}
                                {navLink('/playlists', 'Playlists')}
                            </ul>
                        )}
                    </li>
                </ul>
            </nav>

            {/* Footer */}
            <div className="sidebar-footer p-3 border-top border-secondary">
                <button
                    className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
                    onClick={handleLogout}
                >
                    <span>⇥</span> Exit
                </button>
            </div>
        </aside>
    );
};