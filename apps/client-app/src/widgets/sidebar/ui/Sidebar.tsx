'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/widgets/layout/model/contexts';
import { AccountSwitcher } from '@/widgets/account-switcher/ui/AccountSwitcher';
import { CreatePlaylistModal } from '@/features/playlist/create/ui/CreatePlaylistModal';
import { getImageUrl } from '@/shared/lib/getImageUrl';
import { useQueryClient } from '@tanstack/react-query';
import { usePlayer } from '@/entities/player/lib/usePlayer';
import { usePlayerStore } from '@/entities/player/model/playerStore';

import {
    useGetApiMePlaylists,
    useGetApiMeRecentlyPlayed,
    getGetApiMePlaylistsQueryKey,
    type UserPlaylistDto,
    type RecentlyPlayedTrackDto,
    type TrackArtistDto,
} from '@repo/api/client.ts';

// ══════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════
const extractList = <T,>(raw: unknown): T[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw as T[];
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.data))  return obj.data  as T[];
    if (Array.isArray(obj.items)) return obj.items as T[];
    return [];
};

// ══════════════════════════════════════════════════════════
// NAV ITEM
// ══════════════════════════════════════════════════════════
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

// ══════════════════════════════════════════════════════════
// SIDEBAR
// ══════════════════════════════════════════════════════════
interface SidebarProps {
    onResizeStart?: (e: React.MouseEvent) => void;
}

export const Sidebar = ({ onResizeStart }: SidebarProps) => {
    const pathname = usePathname();
    const queryClient = useQueryClient();
    const { playQueue } = usePlayer();
    const { collapsed, setCollapsed, sidebarWidth } = useSidebar();
    const isActive = (href: string) => pathname === href;

    const [createPlaylistOpen, setCreatePlaylistOpen] = useState(false);

    const currentTrackId = usePlayerStore((s) => s.currentTrack?.id);
    const playerStatus   = usePlayerStore((s) => s.status);

    const isPlayerActive = playerStatus !== 'idle';

    // ─── Плейлисти ────────────────────────────────────────
    const { data: playlistsRaw, refetch: refetchPlaylists } = useGetApiMePlaylists(
        { PageSize: 20 },
        {
            query: {
                queryKey: getGetApiMePlaylistsQueryKey({ PageSize: 20 }),
                refetchOnWindowFocus: true,
                staleTime: 0,
            }
        }
    );

    const playlists = extractList<UserPlaylistDto>(playlistsRaw)
        .filter(p => !p.isSystem);

    // ─── Нещодавно прослухані ─────────────────────────────
    const { data: recentRaw } = useGetApiMeRecentlyPlayed({ Limit: 5 });
    const recentTracks = extractList<RecentlyPlayedTrackDto>(recentRaw);

    // Реактивно оновлюємо плейлисти при зміні сторінок
    useEffect(() => {
        refetchPlaylists();
    }, [pathname, refetchPlaylists]);

    // ─── 🌟 ОБРОБНИК КЛІКУ ТА ЗАПУСКУ ЧЕРГИ ТРЕКІВ ────────────────────────────
    const handleTrackClick = (index: number) => {
        if (recentTracks.length === 0) return;

        // Мапимо елементи RecentlyPlayedTrackDto у стабільний формат PlayerTrack для плеєра
        const playerQueue = recentTracks.map(t => ({
            id:          t.id ?? '',
            title:       t.title ?? 'Без назви',
            artistNames: (t.artists ?? []).map((a: TrackArtistDto) => a.name ?? ''),
            coverUrl:    getImageUrl(t.coverUrl),
            isSaved:     t.isSaved ?? false,
        }));

        // Запускаємо потік з обраного індексу. Джерело маркуємо як 'Search', id — null
        playQueue(playerQueue, index, 'Search', null);
    };

    return (
        <>
            <aside
                className={`client-sidebar${collapsed ? ' client-sidebar--collapsed' : ''}`}
                style={{ width: collapsed ? undefined : sidebarWidth }}
            >
                <div className="client-sidebar__inner">

                    {/* Заголовок "Меню" */}
                    <div className="client-sidebar__header">
                        {!collapsed && (
                            <span className="client-sidebar__header-title">Menu</span>
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

                    {/* Перемикач акаунтів */}
                    <AccountSwitcher collapsed={collapsed} />

                    {/* Навігація */}
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

                    {/* Список ваших плейлістів */}
                    <div className="client-sidebar__section">
                        {!collapsed && (
                            <div className="client-sidebar__sub-header">
                                <p className="client-sidebar__sub-title">Ваші плейлисти</p>
                                <Image src="/images/icons/list.svg" alt="list" width={18} height={18} />
                            </div>
                        )}

                        {playlists.length > 0 ? (
                            <div className="client-sidebar__playlist-list">
                                {playlists.map(pl => {
                                    const computedCover = pl.coverUrl && pl.coverUrl.startsWith('/api')
                                        ? pl.coverUrl
                                        : (getImageUrl(pl.coverUrl) ?? 'images/playlist/placeholder.png');

                                    return (
                                        <Link
                                            key={pl.id}
                                            href={`/playlist/${pl.id}`}
                                            className={`client-sidebar__playlist-item${collapsed ? ' client-sidebar__playlist-item--collapsed' : ''}`}
                                            title={collapsed ? `${pl.title ?? 'Без назви'}` : undefined}
                                        >
                                            <div
                                                className="client-sidebar__playlist-avatar"
                                                style={{
                                                    backgroundImage: `url(${computedCover})`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                    backgroundColor: 'transparent',
                                                }}
                                            />

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
                                    );
                                })}
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

                    {/* Секція "Нещодавно прослухані" */}
                    {!collapsed && (
                        <div className="client-sidebar__section">
                            <div className="client-sidebar__sub-header">
                                <p className="client-sidebar__sub-title">Нещодавно прослухані</p>
                                {recentTracks.length > 0 && (
                                    <Image
                                        src="/images/icons/refresh.svg"
                                        alt="refresh"
                                        width={18}
                                        height={18}
                                    />
                                )}
                            </div>

                            {recentTracks.length > 0 ? (
                                /* 🌟 ФІКС №2: Додаємо d-flex flex-column gap-2 для стабільної відстані між треками */
                                <div className="client-sidebar__recent-list">
                                    {recentTracks.map((track, index) => {
                                        const coverSrc = getImageUrl(track.coverUrl) ?? '/playlist/placeholder.png';
                                        const artistNames = (track.artists ?? [])
                                            .map((a: TrackArtistDto) => a.name ?? '')
                                            .join(', ');

                                        const isCurrentTrackPlaying = currentTrackId === track.id && playerStatus === 'playing';
                                        const isSelected = currentTrackId === track.id;

                                        // Збираємо класи на основі станів
                                        const itemClassName = `client-sidebar__recent-item ${
                                            isCurrentTrackPlaying
                                                ? 'is-playing'
                                                : isSelected
                                                    ? 'is-selected'
                                                    : ''
                                        }`;

                                        return (
                                            <button
                                                key={track.id}
                                                type="button"
                                                onClick={() => handleTrackClick(index)}
                                                className={itemClassName}
                                            >
                                                {/* Обкладинка тепер чиста, без жодних іконок поверх неї */}
                                                <div
                                                    className="client-sidebar__playlist-avatar client-sidebar__playlist-avatar--rounded flex-shrink-0"
                                                    style={{ backgroundImage: `url(${coverSrc})` }}
                                                />

                                                <div className="client-sidebar__playlist-info ms-3 overflow-hidden">
                    <span className="client-sidebar__playlist-name text-truncate d-block">
                        {track.title ?? '—'}
                    </span>
                                                    <span className="client-sidebar__playlist-type text-truncate d-block">
                        {artistNames || '—'}
                    </span>
                                                </div>

                                                {/* 🌟 Іконка звуку тепер з'являється строго СБОКУ (праворуч) */}
                                                {isCurrentTrackPlaying && (
                                                    <div className="client-sidebar__status-icon">
                                                        <i className="bi bi-volume-up-fill" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}

                                    {/* Невидима розпірка під плеєр */}
                                    {isPlayerActive && <div className="client-sidebar__player-spacer" />}
                                </div>
                            ) : (
                                <div className="d-flex flex-column align-items-center gap-2 py-3 text-center">
                                    <Image
                                        src="/images/sidebar/empty-recent.svg"
                                        alt="Історія прослуховувань порожня"
                                        width={120}
                                        height={120}
                                        className="opacity-50"
                                    />
                                    <p className="client-sidebar__empty-text m-0 px-2" style={{ fontSize: '12px', color: 'var(--client-text-muted)' }}>
                                        Тут з`являться треки, які ти послухаєш
                                    </p>
                                    {isPlayerActive && <div style={{ height: '95px', minHeight: '95px', width: '100%' }} />}
                                </div>
                            )}
                        </div>
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
                onSuccess={() => {
                    setCreatePlaylistOpen(false);
                    refetchPlaylists();
                    void queryClient.invalidateQueries({ queryKey: ['getApiMePlaylists'] });
                }}
            />
        </>
    );
};