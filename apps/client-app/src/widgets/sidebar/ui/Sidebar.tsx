'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/widgets/layout/model/contexts';
import { AccountSwitcher } from '@/widgets/account-switcher/ui/AccountSwitcher';
import { CreatePlaylistModal } from '@/features/playlist/create/ui/CreatePlaylistModal';
import { getImageUrl } from '@/shared/lib/getImageUrl';
import {
    useGetApiMePlaylists,
    useGetApiMeRecentlyPlayed,
    type UserPlaylistDto,
    type RecentlyPlayedTrackDto,
    type TrackArtistDto,
} from '@repo/api/client.ts';

const extractList = <T,>(raw: unknown): T[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw as T[];
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.data))  return obj.data  as T[];
    if (Array.isArray(obj.items)) return obj.items as T[];
    return [];
};

interface NavItemProps {
    label:     string;
    icon:      string;
    isActive?: boolean;
    href?:     string;
    onClick?:  () => void;
    collapsed?: boolean;
}

const NavItem = ({ label, icon, isActive, href, onClick, collapsed }: NavItemProps) => {
    const className = `client-sidebar__nav-item${isActive ? ' client-sidebar__nav-item--active' : ''}${collapsed ? ' px-3' : ''}`;

    const content = (
        <>
            <span className="client-sidebar__nav-icon" title={collapsed ? label : undefined}>
                <Image src={`/images/icons/${icon}.svg`} alt={label} width={18} height={18} />
            </span>
            <span className="client-sidebar__nav-label">{label}</span>
        </>
    );

    if (href) return <Link href={href} className={className}>{content}</Link>;
    return <button className={className} onClick={onClick}>{content}</button>;
};

interface SidebarProps {
    onResizeStart?: (e: React.MouseEvent) => void;
}

export const Sidebar = ({ onResizeStart }: SidebarProps) => {
    const pathname = usePathname();
    const { collapsed, setCollapsed, sidebarWidth } = useSidebar();
    const isActive = (href: string) => pathname === href;

    const [createPlaylistOpen, setCreatePlaylistOpen] = useState(false);

    const { data: playlistsRaw } = useGetApiMePlaylists({ PageSize: 20 });
    const playlists = extractList<UserPlaylistDto>(playlistsRaw)
        .filter(p => !p.isSystem);

    const { data: recentRaw } = useGetApiMeRecentlyPlayed({ Limit: 5 });
    const recentTracks = extractList<RecentlyPlayedTrackDto>(recentRaw);

    return (
        <>
            <aside
                className={`client-sidebar${collapsed ? ' client-sidebar--collapsed' : ''}`}
                style={{ width: collapsed ? undefined : sidebarWidth }}
            >
                <div className="client-sidebar__inner">

                    <div className="client-sidebar__header">
                        {!collapsed && (
                            <span className="client-sidebar__header-title">Меню</span>
                        )}
                        <button
                            className="client-sidebar__collapse-btn"
                            onClick={() => setCollapsed(!collapsed)}
                            aria-label={collapsed ? 'Розгорнути меню' : 'Згорнути меню'}
                            title={collapsed ? 'Розгорнути меню' : 'Згорнути меню'}
                        >
                            <Image
                                src={collapsed
                                    ? '/images/icons/chevron-right.svg'
                                    : '/images/icons/chevron-left.svg'
                                }
                                alt={collapsed ? 'expand' : 'collapse'}
                                width={16}
                                height={16}
                            />
                        </button>
                    </div>

                    <AccountSwitcher collapsed={collapsed} />

                    <div className="client-sidebar__section">
                        <nav className="client-sidebar__nav">
                            <NavItem
                                href="/home"
                                icon="home"
                                label="Головна"
                                isActive={isActive('/home')}
                                collapsed={collapsed}
                            />
                            <NavItem
                                href="/library"
                                icon="library"
                                label="Моя медіатека"
                                isActive={isActive('/library')}
                                collapsed={collapsed}
                            />
                            <NavItem
                                href="/favorites"
                                icon="heart"
                                label="Улюблені треки"
                                isActive={isActive('/favorites')}
                                collapsed={collapsed}
                            />
                            <NavItem
                                icon="plus-square"
                                label="Створити плейліст"
                                onClick={() => setCreatePlaylistOpen(true)}
                                collapsed={collapsed}
                            />
                        </nav>
                        <hr />
                    </div>

                    <div className="client-sidebar__section">
                        {!collapsed && (
                            <div className="client-sidebar__sub-header">
                                <p className="client-sidebar__sub-title">Ваші плейлисти</p>
                                <Image src="/images/icons/list.svg" alt="list" width={18} height={18} />
                            </div>
                        )}

                        {playlists.length > 0 ? (
                            <div className="client-sidebar__playlist-list">
                                {playlists.map(pl => (
                                    <Link
                                        key={pl.id}
                                        href={`/playlist/${pl.id}`}
                                        className={`client-sidebar__playlist-item${collapsed ? ' client-sidebar__playlist-item--collapsed' : ''}`}
                                        title={collapsed ? `${pl.title ?? 'Без назви'}` : undefined}
                                    >
                                        <div
                                            className="client-sidebar__playlist-avatar"
                                            style={{
                                                backgroundImage: pl.coverUrl
                                                    ? `url(${getImageUrl(pl.coverUrl)})`
                                                    : undefined,
                                                backgroundColor: pl.coverUrl
                                                    ? undefined
                                                    : 'var(--client-surface-2)',
                                            }}
                                        >
                                            {!pl.coverUrl && (
                                                <i className="bi bi-music-note" />
                                            )}
                                        </div>

                                        {!collapsed && (
                                            <div className="client-sidebar__playlist-info">
                            <span className="client-sidebar__playlist-name">
                                {pl.title ?? 'Без назви'}
                            </span>
                                                <span className="client-sidebar__playlist-type">
                                Плейліст · {pl.tracksCount ?? 0} треків
                            </span>
                                            </div>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            !collapsed && (
                                <p className="client-sidebar__empty-text">
                                    Немає плейлістів
                                </p>
                            )
                        )}
                        <hr />
                    </div>

                    {!collapsed && (
                        <>

                            {recentTracks.length > 0 && (
                                <div className="client-sidebar__section">
                                    <div className="client-sidebar__sub-header">
                                        <p className="client-sidebar__sub-title">Нещодавно прослухані</p>
                                        <Image
                                            src="/images/icons/refresh.svg"
                                            alt="refresh"
                                            width={18}
                                            height={18}
                                        />
                                    </div>
                                    <div className="client-sidebar__playlist-list">
                                        {recentTracks.map(track => {
                                            const coverSrc   = getImageUrl(track.coverUrl);
                                            const artistNames = (track.artists ?? [])
                                                .map((a: TrackArtistDto) => a.name ?? '')
                                                .join(', ');

                                            return (
                                                <Link
                                                    key={track.id}
                                                    href={`/tracks/${track.id}`}
                                                    className="client-sidebar__playlist-item"
                                                >
                                                    <div
                                                        className="client-sidebar__playlist-avatar client-sidebar__playlist-avatar--rounded"
                                                        style={{
                                                            backgroundImage: coverSrc
                                                                ? `url(${coverSrc})`
                                                                : undefined,
                                                            backgroundColor: coverSrc
                                                                ? undefined
                                                                : 'var(--client-surface-2)',
                                                        }}
                                                    >
                                                        {!coverSrc && <i className="bi bi-music-note" />}
                                                    </div>
                                                    <div className="client-sidebar__playlist-info">
                                                        <span className="client-sidebar__playlist-name">
                                                            {track.title ?? '—'}
                                                        </span>
                                                        <span className="client-sidebar__playlist-type">
                                                            {artistNames || '—'}
                                                        </span>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {!collapsed && (
                    <div
                        className="client-sidebar__resize-handle"
                        onMouseDown={onResizeStart}
                    />
                )}
            </aside>

            <CreatePlaylistModal
                isOpen={createPlaylistOpen}
                onClose={() => setCreatePlaylistOpen(false)}
                onSuccess={() => setCreatePlaylistOpen(false)}
            />
        </>
    );
};