'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/widgets/layout/ui/ClientLayout';

const MOCK_PLAYLISTS = [
    { id: '1', name: 'Lisa',         type: 'Виконавець', avatarUrl: 'https://picsum.photos/seed/pl1/40/40' },
    { id: '2', name: 'Lady Gaga',    type: 'Виконавець', avatarUrl: 'https://picsum.photos/seed/pl2/40/40' },
    { id: '3', name: 'Bruno Mars',   type: 'Виконавець', avatarUrl: 'https://picsum.photos/seed/pl3/40/40' },
    { id: '4', name: 'BTS',          type: 'Виконавець', avatarUrl: 'https://picsum.photos/seed/pl4/40/40' },
    { id: '5', name: 'Lana Del Rey', type: 'Плейліст',   avatarUrl: 'https://picsum.photos/seed/pl5/40/40' },
];

/**
 * Іконки — public/images/icons/
 *   home.svg, library.svg, heart.svg, plus-square.svg,
 *   list.svg, refresh.svg, chevron-left.svg, chevron-right.svg
 */

const NavItem = ({
                     href, icon, label, isActive,
                 }: { href: string; icon: string; label: string; isActive: boolean }) => (
    <Link href={href} className={`client-sidebar__nav-item${isActive ? ' client-sidebar__nav-item--active' : ''}`}>
        <span className="client-sidebar__nav-icon">
            <Image src={`/images/icons/${icon}.svg`} alt={label} width={18} height={18} />
        </span>
        <span className="client-sidebar__nav-label">{label}</span>
    </Link>
);

const NavButton = ({
                       icon, label, onClick,
                   }: { icon: string; label: string; onClick?: () => void }) => (
    <button className="client-sidebar__nav-item client-sidebar__nav-item--btn" onClick={onClick}>
        <span className="client-sidebar__nav-icon">
            <Image src={`/images/icons/${icon}.svg`} alt={label} width={18} height={18} />
        </span>
        <span className="client-sidebar__nav-label">{label}</span>
    </button>
);

export const Sidebar = () => {
    const pathname = usePathname();
    const { collapsed, setCollapsed } = useSidebar();
    const isActive = (href: string) => pathname === href;

    return (
        <>
            <aside className={`client-sidebar${collapsed ? ' client-sidebar--collapsed' : ''}`}>
                <div className="client-sidebar__inner">

                    {/* Меню */}
                    <div className="client-sidebar__section">
                        <p className="client-sidebar__section-title">Меню</p>
                        <nav className="client-sidebar__nav">
                            <NavItem href="/home"    icon="home"    label="Головна"       isActive={isActive('/home')} />
                            <NavItem href="/library" icon="library" label="Моя медіатека" isActive={isActive('/library')} />
                        </nav>
                    </div>

                    {/* Плейлисти */}
                    <div className="client-sidebar__section">
                        <p className="client-sidebar__section-title">Плейлисти</p>
                        <nav className="client-sidebar__nav">
                            <NavItem href="/favorites" icon="heart"       label="Улюблені треки"    isActive={isActive('/favorites')} />
                            <NavButton                  icon="plus-square" label="Створити плейліст" />
                        </nav>
                    </div>

                    {/* Ваші плейлисти */}
                    <div className="client-sidebar__section client-sidebar__section--grow">
                        <div className="client-sidebar__sub-header">
                            <p className="client-sidebar__sub-title">Ваші плейлисти</p>
                            <button className="client-sidebar__icon-btn" aria-label="Manage">
                                <Image src="/images/icons/list.svg" alt="list" width={16} height={16} />
                            </button>
                        </div>
                        <div className="client-sidebar__playlist-list">
                            {MOCK_PLAYLISTS.map((pl) => (
                                <Link key={pl.id} href={`/playlist/${pl.id}`} className="client-sidebar__playlist-item">
                                    <img src={pl.avatarUrl} alt={pl.name} className="client-sidebar__playlist-avatar" />
                                    <div className="client-sidebar__playlist-info">
                                        <span className="client-sidebar__playlist-name">{pl.name}</span>
                                        <span className="client-sidebar__playlist-type">{pl.type}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Нещодавно прослухані */}
                    <div className="client-sidebar__section">
                        <div className="client-sidebar__sub-header">
                            <p className="client-sidebar__sub-title">Нещодавно прослухані</p>
                            <button className="client-sidebar__icon-btn" aria-label="Refresh">
                                <Image src="/images/icons/refresh.svg" alt="refresh" width={16} height={16} />
                            </button>
                        </div>
                        <div className="client-sidebar__current-track">
                            <div className="client-sidebar__vinyl" />
                        </div>
                    </div>

                </div>

                {/* Кнопка collapse — виступає за правий край картки */}
                <button
                    className="client-sidebar__toggle"
                    onClick={() => setCollapsed(true)}
                    aria-label="Сховати сайдбар"
                >
                    <Image src="/images/icons/chevron-left.svg" alt="collapse" width={14} height={14} />
                </button>
            </aside>

            {/* Кнопка відкрити — з'являється коли collapsed */}
            {collapsed && (
                <button
                    className="client-sidebar__restore-btn"
                    onClick={() => setCollapsed(false)}
                    aria-label="Показати сайдбар"
                >
                    <Image src="/images/icons/chevron-right.svg" alt="open" width={14} height={14} />
                </button>
            )}
        </>
    );
};