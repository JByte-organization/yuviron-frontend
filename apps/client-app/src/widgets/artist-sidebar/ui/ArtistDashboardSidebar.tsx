'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/widgets/layout/model/contexts';

interface NavItemProps {
    label: string;
    icon: React.ReactNode;
    href: string;
    isActive?: boolean;
}

const NavItem = ({ label, icon, href, isActive }: NavItemProps) => (
    <Link
        href={href}
        className={`client-sidebar__nav-item${isActive ? ' client-sidebar__nav-item--active' : ''}`}
    >
        <span className="client-sidebar__nav-icon">{icon}</span>
        <span className="client-sidebar__nav-label">{label}</span>
    </Link>
);

export const ArtistDashboardSidebar = () => {
    const pathname = usePathname();
    const { collapsed, setCollapsed } = useSidebar();

    const isActive = (href: string) =>
        pathname === href || pathname.startsWith(href + '/');

    return (
        <>
            <aside className={`client-sidebar${collapsed ? ' client-sidebar--collapsed' : ''}`}>
                <div className="client-sidebar__inner">

                    {/* Кабінет */}
                    <div className="client-sidebar__section">
                        <p className="client-sidebar__section-title">Кабінет артиста</p>
                        <nav className="client-sidebar__nav">
                            <NavItem
                                href="/artist-dashboard"
                                label="Мій профіль"
                                isActive={pathname === '/artist-dashboard'}
                                icon={<i className="bi bi-person-circle" />}
                            />
                            <NavItem
                                href="/artist-dashboard/tracks"
                                label="Мої треки"
                                isActive={isActive('/artist-dashboard/tracks')}
                                icon={<i className="bi bi-music-note-list" />}
                            />
                            <NavItem
                                href="/artist-dashboard/albums"
                                label="Мої альбоми"
                                isActive={isActive('/artist-dashboard/albums')}
                                icon={<i className="bi bi-collection" />}
                            />
                            <NavItem
                                href="/artist-dashboard/team"
                                label="Команда"
                                isActive={isActive('/artist-dashboard/team')}
                                icon={<i className="bi bi-people" />}
                            />
                        </nav>
                        <hr className="client-sidebar__divider" />
                    </div>

                    {/* Аналітика та фінанси */}
                    <div className="client-sidebar__section">
                        <p className="client-sidebar__section-title">Аналітика</p>
                        <nav className="client-sidebar__nav">
                            <NavItem
                                href="/artist-dashboard/analytics"
                                label="Статистика"
                                isActive={isActive('/artist-dashboard/analytics')}
                                icon={<i className="bi bi-graph-up" />}
                            />
                            <NavItem
                                href="/artist-dashboard/finance"
                                label="Фінанси"
                                isActive={isActive('/artist-dashboard/finance')}
                                icon={<i className="bi bi-wallet2" />}
                            />
                        </nav>
                        <hr className="client-sidebar__divider" />
                    </div>

                    {/* Налаштування */}
                    <div className="client-sidebar__section">
                        <nav className="client-sidebar__nav">
                            <NavItem
                                href="/artist-dashboard/settings"
                                label="Налаштування"
                                isActive={isActive('/artist-dashboard/settings')}
                                icon={<i className="bi bi-gear" />}
                            />
                        </nav>
                    </div>

                </div>

                <button
                    className="client-sidebar__toggle"
                    onClick={() => setCollapsed(true)}
                    aria-label="Сховати сайдбар"
                >
                    <i className="bi bi-chevron-left" />
                </button>
            </aside>

            {collapsed && (
                <button
                    className="client-sidebar__restore-btn"
                    onClick={() => setCollapsed(false)}
                    aria-label="Показати сайдбар"
                >
                    <i className="bi bi-chevron-right" />
                </button>
            )}
        </>
    );
};