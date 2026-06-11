'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const AccountSidebar = () => {
    const pathname = usePathname();

    const menuItems = [
        { name: 'Account overview', href: '/account-settings', icon: 'bi-grid-1x2' },
        { name: 'Edit profile', href: '/account-settings/profile', icon: 'bi-pencil-square' },
        { name: 'Change password & Security', href: '/account-settings/security', icon: 'bi-shield-lock' },
        { name: 'Notification settings', href: '/account-settings/notifications', icon: 'bi-bell' },
    ];

    return (
        <aside className="account-sidebar">
            <div className="sidebar-sticky-panel">
                <div className="user-nav-meta mb-3">
                    <div className="d-flex align-items-center gap-1">
                        <div className="nav-avatar-placeholder mb-2">Y</div>
                        <div>uviron Account</div>
                    </div>

                    <span className="text-secondary fs-14">Control panel</span>
                </div>

                <nav className="account-nav-menu d-flex flex-column gap-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`nav-menu-link ${isActive ? 'nav-link-active' : ''}`}
                            >
                                <i className={`bi ${item.icon} nav-link-icon`} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
};