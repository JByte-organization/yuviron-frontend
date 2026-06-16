'use client';

import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Image from "next/image";
import Link from 'next/link';

import { useAdminSessionStore } from '@/entities/adminSession/model/store';
import { SIDEBAR_WIDTH } from '@/shared/config/constants';
import { JamendoSyncModal } from '@/features/track/sync-jamendo/ui/JamendoSyncModal';
import { customInstance } from '@/../../../packages/api/src/mutator';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const ADMIN_LOGGED_IN_COOKIE = "admin_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";

export const Sidebar = ({ isOpen, onClose }: Props) => {
    const pathname = usePathname();
    const router = useRouter();
    const [elementsOpen, setElementsOpen] = useState(true);
    const [isSyncOpen, setIsSyncOpen] = useState(false);

    const clearAdminSession = useAdminSessionStore((state) => state.clearAdminSession);

    const handleLogout = async () => {
        try {
            await customInstance('/auth/logout', {
                method: 'POST',
            });
        } catch (error) {
            console.error('Logout request failed:', error);
        }

        document.cookie = ADMIN_LOGGED_IN_COOKIE;
        clearAdminSession();
        router.replace('/login');
    };

    useEffect(() => {
        if (window.innerWidth < 992) {
            onClose();
        }
    }, [pathname, onClose]);

    const navLink = (href: string, label: string) => (
        <li key={href}>
            <Link href={href} className={`nav-link ${pathname === href ? 'active' : ''}`}>
                {label}
            </Link>
        </li>
    );

    return (
        <>
            <aside
                className="admin-sidebar d-flex flex-column"
                style={{
                    position: 'fixed',
                    top: 0, left: 0, height: '100vh',
                    width: `${SIDEBAR_WIDTH}px`,
                    zIndex: 1045,
                    transform: isOpen ? 'translateX(0)' : `translateX(-${SIDEBAR_WIDTH}px)`,
                    transition: 'transform 0.25s ease',
                    overflowY: 'auto',
                }}
            >
                <div className="sidebar-header d-flex align-items-center justify-content-between p-3">
                    <div className="d-flex align-items-center gap-2">
                        <Image src="/images/logo/logo-element.svg" width={50} height={40} alt="logo" />
                        <p className="m-0 fw-medium text-white h5">Admin Dashboard</p>
                    </div>
                    <button className="btn btn-sm btn-outline-secondary border-0 d-lg-none" onClick={onClose}>
                        <Image src="/images/icons/delete-btn.svg" width={16} height={16} alt="close" />
                    </button>
                </div>

                <nav className="sidebar-nav flex-grow-1">
                    <ul className="list-unstyled">
                        {navLink('/dashboard', 'Dashboard')}
                        {navLink('/users',     'Users')}
                        {navLink('/artists',   'Artists')}
                        {navLink('/verification', 'Verification')}
                        {navLink('/payout', 'Finance')}
                        {navLink('/ads', 'Ads')}
                        {navLink('/plans', 'Premium Plans')}

                        <li className="nav-group">
                            <div className="nav-link d-flex justify-content-between align-items-center" style={{ cursor: 'pointer' }} onClick={() => setElementsOpen(o => !o)}>
                                <span>Elements</span>
                                <span style={{ display: 'inline-block', transform: elementsOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s', fontSize: '0.7rem' }}>▲</span>
                            </div>
                            {elementsOpen && (
                                <ul className="list-unstyled ps-4 submenu">
                                    {navLink('/banners',    'Banners')}
                                    {navLink('/banner-requests', 'Banner Requests')}
                                    {navLink('/tracks',    'Tracks')}
                                    {navLink('/albums',    'Albums')}
                                    {navLink('/genres',    'Genres')}
                                    {navLink('/moods',     'Moods')}
                                    {navLink('/playlists', 'Playlists')}
                                </ul>
                            )}
                        </li>
                        <li className="px-3 my-2"><hr className="border-secondary m-0" style={{ opacity: 0.3 }} /></li>
                        <li className="px-3">
                            <button type="button" className="btn btn-sm btn-outline-info w-100 py-2 d-flex align-items-center justify-content-center gap-2" onClick={() => setIsSyncOpen(true)} style={{ fontSize: '0.8rem', fontWeight: 600, borderStyle: 'dashed' }}>
                                <i className="bi bi-cloud-arrow-down-fill fs-6" /> Sync Jamendo Catalog
                            </button>
                        </li>
                    </ul>
                </nav>

                <div className="sidebar-footer p-3 border-top border-secondary">
                    <button className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2" onClick={handleLogout}>
                        <span>⇥</span> Exit
                    </button>
                </div>
            </aside>
            <JamendoSyncModal isOpen={isSyncOpen} onClose={() => setIsSyncOpen(false)} />
        </>
    );
};