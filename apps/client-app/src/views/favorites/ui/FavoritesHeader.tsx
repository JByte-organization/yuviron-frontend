'use client';

import React, { useMemo, useState } from 'react';
import { usePlayer } from '@/entities/player/lib/usePlayer';
import { usePlayerStore } from '@/entities/player/model/playerStore';
import type { TrackRowData } from '@/entities/track/ui/TrackRow';
import { useGetApiAuthMe } from '@repo/api/client.ts';
import type { SortField, SortOrder } from '../FavoritesPage';

interface FavoritesHeaderProps {
    tracks: TrackRowData[];
    search: string;
    onSearchChange: (value: string) => void;
    sortBy: SortField;
    onSortByChange: (field: SortField) => void;
    sortOrder: SortOrder;
    onSortOrderChange: (order: SortOrder) => void;
}

export const FavoritesHeader = ({
                                    tracks = [],
                                    search,
                                    onSearchChange,
                                    sortBy,
                                    onSortByChange,
                                    sortOrder,
                                    onSortOrderChange,
                                }: FavoritesHeaderProps) => {
    const { playQueue, togglePlay } = usePlayer();

    // Стейт для розгортання поля пошуку (як у Spotify)
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);

    const { data: meRaw, isLoading: isUserLoading } = useGetApiAuthMe();

    const userName = useMemo(() => {
        if (!meRaw) return 'Користувач';
        const me = (meRaw as any)?.data || meRaw;
        return me?.profile?.firstName || 'Користувач';
    }, [meRaw]);

    const currentTrackId = usePlayerStore((s) => s.currentTrack?.id);
    const playerStatus   = usePlayerStore((s) => s.status);

    const isCollectionPlaying = useMemo(() => {
        if (playerStatus !== 'playing' || tracks.length === 0) return false;
        return tracks.some((t) => t.id === currentTrackId);
    }, [tracks, currentTrackId, playerStatus]);

    const handlePlayAll = () => {
        if (tracks.length === 0) return;

        if (isCollectionPlaying) {
            togglePlay();
        } else {
            const queue = tracks.map((t) => ({
                id:          t.id,
                title:       t.title,
                artistNames: t.artistNames,
                coverUrl:    t.coverUrl,
                durationMs:  t.durationMs ?? undefined,
            }));
            playQueue(queue, 0, 'Playlist', 'favorites');
        }
    };

    const handleShufflePlay = () => {
        if (tracks.length === 0) return;

        const shuffledTracks = [...tracks].sort(() => Math.random() - 0.5);
        const queue = shuffledTracks.map((t) => ({
            id:          t.id,
            title:       t.title,
            artistNames: t.artistNames,
            coverUrl:    t.coverUrl,
            durationMs:  t.durationMs ?? undefined,
        }));
        playQueue(queue, 0, 'Playlist', 'favorites');
    };

    // ─── ОБРОБНИК КЛІКУ СОРТУВАННЯ (Циклічне перемикання) ──────────────────
    const handleSortClick = () => {
        if (sortBy === 'addedAt' && sortOrder === 'desc') {
            onSortOrderChange('asc'); // Спочатку старі треки
        } else if (sortBy === 'addedAt' && sortOrder === 'asc') {
            onSortByChange('title');  // Перемикаємо на сортування за назвою
            onSortOrderChange('asc');
        } else if (sortBy === 'title' && sortOrder === 'asc') {
            onSortOrderChange('desc'); // Назва від Я до А
        } else {
            onSortByChange('addedAt'); // Повертаємося до дефолту (нові зверху)
            onSortOrderChange('desc');
        }
    };

    const sortButtonLabel = useMemo(() => {
        if (sortBy === 'title') {
            return sortOrder === 'asc' ? 'Назва (А-Я)' : 'Назва (Я-А)';
        }
        return sortOrder === 'desc' ? 'Дата додавання (Нові)' : 'Дата додавання (Старі)';
    }, [sortBy, sortOrder]);

    return (
        <div className="favorites-header">
            <p className="favorites-header__breadcrumb">Плейліст</p>
            <h1 className="favorites-header__title">Улюблені треки</h1>

            <div className="favorites-header__meta d-flex align-items-center flex-wrap" style={{ minHeight: '24px' }}>
                <i className="bi bi-person-fill me-1" />
                {isUserLoading ? (
                    <span className="skeleton ms-1" style={{ width: 80, height: 16, display: 'inline-block', borderRadius: 4 }} />
                ) : (
                    <span className="fw-semibold text-white ms-1">{userName}</span>
                )}
                {tracks.length > 0 && (
                    <span className="ms-2 text-muted">• {tracks.length} тр.</span>
                )}
            </div>

            <div className="favorites-header__actions d-flex align-items-center gap-3 mt-4">
                <button
                    className={`favorites-header__btn favorites-header__btn--play${isCollectionPlaying ? ' favorites-header__btn--active' : ''}`}
                    onClick={handlePlayAll}
                    aria-label={isCollectionPlaying ? 'Pause' : 'Play'}
                >
                    <i className={`bi ${isCollectionPlaying ? 'bi-pause-fill' : 'bi bi-play-fill'}`} />
                </button>

                <button className="favorites-header__btn favorites-header__btn--icon" onClick={handleShufflePlay} aria-label="Shuffle">
                    <i className="bi bi-shuffle" />
                </button>

                {/* ─── ІНТЕРАКТИВНИЙ ПОШУК ТА СОРТУВАННЯ ────────────────────── */}
                <div className="ms-auto d-flex align-items-center gap-2">

                    <div className={`favorites-header__search-container d-flex align-items-center ${isSearchExpanded ? 'favorites-header__search-container--expanded' : ''}`}>
                        <button
                            className="favorites-header__btn favorites-header__btn--icon"
                            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                            aria-label="Toggle search"
                        >
                            <i className="bi bi-search" />
                        </button>

                        {isSearchExpanded && (
                            <input
                                type="text"
                                className="form-control form-control-sm bg-transparent border-0 text-white shadow-none favorites-header__search-input"
                                placeholder="Пошук улюблених пісень..."
                                value={search}
                                onChange={(e) => onSearchChange(e.target.value)}
                                autoFocus
                                style={{ width: '180px', fontSize: '0.85rem' }}
                            />
                        )}
                    </div>

                    <button className="favorites-header__sort btn btn-link p-0 text-decoration-none text-secondary d-flex align-items-center gap-2" onClick={handleSortClick}>
                        <span style={{ fontSize: '0.85rem' }}>{sortButtonLabel}</span>
                        <i className={`bi ${sortOrder === 'asc' ? 'bi-sort-up' : 'bi bi-sort-down'}`} style={{ fontSize: '1.1rem' }} />
                    </button>
                </div>
            </div>

            <div className="favorites-header__columns mt-4">
                <div className="favorites-header__col-index">#</div>
                <div className="favorites-header__col-title">Назва</div>
                <div className="favorites-header__col-album d-none d-md-block">Альбом</div>
                <div className="favorites-header__col-date d-none d-lg-block">Дата додавання</div>
                <div className="favorites-header__col-duration"><i className="bi bi-clock" /></div>
            </div>
        </div>
    );
};