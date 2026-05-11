'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/widgets/layout/ui/ClientLayout';
import { CreatePlaylistModal } from '@/features/playlist/create/ui/CreatePlaylistModal';

const MOCK_PLAYLISTS = [
    { id: '1', name: 'Lisa',         type: 'Плейліст', avatarUrl: 'https://picsum.photos/seed/pl1/40/40' },
    { id: '2', name: 'Lady Gaga',    type: 'Плейліст', avatarUrl: 'https://picsum.photos/seed/pl2/40/40' },
    { id: '3', name: 'Bruno Mars',   type: 'Плейліст', avatarUrl: 'https://picsum.photos/seed/pl3/40/40' },
    { id: '4', name: 'BTS',          type: 'Плейліст', avatarUrl: 'https://picsum.photos/seed/pl4/40/40' },
    { id: '5', name: 'Lana Del Rey', type: 'Плейліст', avatarUrl: 'https://picsum.photos/seed/pl5/40/40' },
];

interface NavItemProps {
    label: string;
    icon: string;
    isActive?: boolean;
    href?: string;
    onClick?: () => void;
}

const NavItem = ({ label, icon, isActive, href, onClick }: NavItemProps) => {
    const className = `client-sidebar__nav-item${isActive ? ' client-sidebar__nav-item--active' : ''}`;

    const content = (
        <>
            <span className="client-sidebar__nav-icon">
                <Image src={`/images/icons/${icon}.svg`} alt={label} width={18} height={18} />
            </span>
            <span className="client-sidebar__nav-label">{label}</span>
        </>
    );

    if (href) {
        return <Link href={href} className={className}>{content}</Link>;
    }

    return <button className={className} onClick={onClick}>{content}</button>;
};

export const Sidebar = () => {
    const pathname = usePathname();
    const { collapsed, setCollapsed } = useSidebar();
    const isActive = (href: string) => pathname === href;

    // ─── Стан модалки ─────────────────────────────────────
    const [createPlaylistOpen, setCreatePlaylistOpen] = useState(false);

    return (
        <>
            <aside className={`client-sidebar${collapsed ? ' client-sidebar--collapsed' : ''}`}>
                <div className="client-sidebar__inner">

                    {/* Меню */}
                    <div className="client-sidebar__section">
                        <p className="client-sidebar__section-title">Меню</p>
                        <nav className="client-sidebar__nav">
                            <NavItem href="/home"      icon="home"        label="Головна"          isActive={isActive('/home')} />
                            <NavItem href="/library"   icon="library"     label="Моя медіатека"    isActive={isActive('/library')} />
                            <NavItem href="/favorites" icon="heart"       label="Улюблені треки"   isActive={isActive('/favorites')} />
                            <NavItem
                                icon="plus-square"
                                label="Створити плейліст"
                                onClick={() => setCreatePlaylistOpen(true)}
                            />
                        </nav>
                        <hr />
                    </div>

                    {/* Ваші плейлисти */}
                    <div className="client-sidebar__section">
                        <div className="client-sidebar__sub-header">
                            <p className="client-sidebar__sub-title">Ваші плейлисти</p>
                            <Image src="/images/icons/list.svg" alt="list" width={18} height={18} />
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
                        <hr />
                    </div>

                    {/* Нещодавно прослухані */}
                    <div className="client-sidebar__section">
                        <div className="client-sidebar__sub-header">
                            <p className="client-sidebar__sub-title">Нещодавно прослухані</p>
                            <Image src="/images/icons/refresh.svg" alt="refresh" width={18} height={18} />
                        </div>
                        <div className="client-sidebar__current-track">
                            <div className="client-sidebar__vinyl" />
                        </div>
                    </div>

                </div>

                <button
                    className="client-sidebar__toggle"
                    onClick={() => setCollapsed(true)}
                    aria-label="Сховати сайдбар"
                >
                    <Image src="/images/icons/chevron-left.svg" alt="collapse" width={14} height={14} />
                </button>
            </aside>

            {collapsed && (
                <button
                    className="client-sidebar__restore-btn"
                    onClick={() => setCollapsed(false)}
                    aria-label="Показати сайдбар"
                >
                    <Image src="/images/icons/chevron-right.svg" alt="open" width={14} height={14} />
                </button>
            )}

            {/* ─── Модальне вікно створення плейліста ─────── */}
            <CreatePlaylistModal
                isOpen={createPlaylistOpen}
                onClose={() => setCreatePlaylistOpen(false)}
                onSuccess={() => {
                    setCreatePlaylistOpen(false);
                    // TODO: refetch плейлистів після підключення хука
                }}
            />
        </>
    );
};