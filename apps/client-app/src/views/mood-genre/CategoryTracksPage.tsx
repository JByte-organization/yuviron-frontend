'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { customInstance } from '@repo/api/client';
import { usePlayer } from '@/entities/player/lib/usePlayer';
import { usePlayerStore } from '@/entities/player/model/playerStore';
import { TrackRow } from '@/entities/track/ui/TrackRow';
import { getImageUrl } from '@/shared/lib/getImageUrl';
import type { TrackRowData } from '@/entities/track/ui/TrackRow';
import type {
    SearchTrackDto,
    SearchTrackDtoPaginatedList,
    GetApiSearchTracksParams
} from '@repo/api/client';

const PAGE_SIZE = 20;
export type CategorySortField = 'default' | 'title';
export type CategorySortOrder = 'asc' | 'desc';

export const CategoryTracksPage = () => {
    const searchParams = useSearchParams();
    const { playQueue, togglePlay } = usePlayer();

    // ─── СТАТУСЫ И УПРАВЛЕНИЕ СПИСКОМ ─────────────────────────────────────
    const [page, setPage] = useState(1);
    const [accumulatedTracks, setAccumulatedTracks] = useState<SearchTrackDto[]>([]);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<CategorySortField>('default');
    const [sortOrder, setSortOrder] = useState<CategorySortOrder>('asc');
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);

    const categoryTitle = searchParams.get('title') || 'Категорія';

    // Сброс состояния при переходе между разными категориями/настроениями
    useEffect(() => {
        setPage(1);
        setAccumulatedTracks([]);
        setSearch('');
        setSortBy('default');
        setSortOrder('asc');
        setIsSearchExpanded(false);
    }, [categoryTitle]);

    // Единственный чистый запрос на получение облегчённого списка треков
    const queryParams: GetApiSearchTracksParams = useMemo(() => ({
        query: categoryTitle,
        page,
        pageSize: PAGE_SIZE,
    }), [categoryTitle, page]);

    const { data, isLoading, isFetching, isError } = useQuery<SearchTrackDtoPaginatedList>({
        queryKey: ['api', 'search', 'tracks', queryParams],
        queryFn: ({ signal }) => customInstance<SearchTrackDtoPaginatedList>(
            `/api/search/tracks?query=${encodeURIComponent(queryParams.query || '')}&page=${queryParams.page}&pageSize=${queryParams.pageSize}`,
            { method: 'GET', signal }
        ),
        enabled: !!categoryTitle,
    });

    // Безопасное накопление бесконечной прокрутки / кнопки подгрузки
    useEffect(() => {
        if (data?.items) {
            setAccumulatedTracks(prev => {
                const existingIds = new Set(prev.map(t => t.id));
                const uniqueNewItems = data.items!.filter(t => t.id && !existingIds.has(t.id));
                return [...prev, ...uniqueNewItems];
            });
        }
    }, [data]);

    const totalCount = data?.totalCount ?? 0;
    const hasMore = data?.hasNextPage ?? (page < (data?.totalPages ?? 1));

    // ─── 1. МАРШАЛИНГ ДАННЫХ БЕЗ ОВЕРХЕДА ЗАПРОСОВ ────────────────────────
    const rawTracks: TrackRowData[] = useMemo(() => {
        return accumulatedTracks.map((t, i) => ({
            id:          t.id ?? '',
            index:       i + 1,
            title:       t.title ?? '—',
            artistNames: (t.artists ?? []).map(a => a.name ?? '—'),
            coverUrl:    getImageUrl(t.coverUrl),
            isSaved:     t.isSaved ?? false,

            // Данных полей нет в SearchTrackDto, поэтому передаём строго undefined.
            // Никаких лишних сетевых запросов. Компонент TrackRow отрендерит их пустые состояния.
            albumId:     undefined,
            albumTitle:  undefined,
            durationMs:  undefined,
            addedAt:     undefined,
        }));
    }, [accumulatedTracks]);

    // ─── 2. КЛИЕНТСКАЯ ФИЛЬТРАЦИЯ И СОРТИРОВКА ДОСТУПНЫХ ПОЛЕЙ ───────────
    const processedTracks = useMemo(() => {
        let result = [...rawTracks];

        if (search.trim()) {
            const query = search.toLowerCase();
            result = result.filter(t =>
                t.title.toLowerCase().includes(query) ||
                t.artistNames.some(name => name.toLowerCase().includes(query))
            );
        }

        result.sort((a, b) => {
            if (sortBy === 'title') {
                return sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
            }
            return sortOrder === 'asc' ? a.index - b.index : b.index - a.index;
        });

        return result.map((t, idx) => ({ ...t, index: idx + 1 }));
    }, [rawTracks, search, sortBy, sortOrder]);

    // ─── 3. ИНТЕГРАЦИЯ С ГЛОБАЛЬНЫМ СТОРОМ ПЛЕЕРА ─────────────────────────
    const currentTrackId = usePlayerStore((s) => s.currentTrack?.id);
    const playerStatus   = usePlayerStore((s) => s.status);

    const isCollectionPlaying = useMemo(() => {
        if (playerStatus !== 'playing' || processedTracks.length === 0) return false;
        return processedTracks.some((t) => t.id === currentTrackId);
    }, [processedTracks, currentTrackId, playerStatus]);

    const handlePlayAll = useCallback(() => {
        if (processedTracks.length === 0) return;

        if (isCollectionPlaying) {
            togglePlay();
        } else {
            const queue = processedTracks.map((t) => ({
                id:          t.id,
                title:       t.title,
                artistNames: t.artistNames,
                coverUrl:    t.coverUrl,
                durationMs:  undefined,
            }));
            playQueue(queue, 0, 'Playlist', `category-${categoryTitle}`);
        }
    }, [processedTracks, isCollectionPlaying, togglePlay, playQueue, categoryTitle]);

    const handleShufflePlay = useCallback(() => {
        if (processedTracks.length === 0) return;

        const shuffled = [...processedTracks].sort(() => Math.random() - 0.5);
        const queue = shuffled.map((t) => ({
            id:          t.id,
            title:       t.title,
            artistNames: t.artistNames,
            coverUrl:    t.coverUrl,
            durationMs:  undefined,
        }));
        playQueue(queue, 0, 'Playlist', `category-${categoryTitle}`);
    }, [processedTracks, playQueue, categoryTitle]);

    const handleSortClick = () => {
        if (sortBy === 'default' && sortOrder === 'asc') {
            setSortOrder('desc');
        } else if (sortBy === 'default' && sortOrder === 'desc') {
            setSortBy('title');
            setSortOrder('asc');
        } else if (sortBy === 'title' && sortOrder === 'asc') {
            setSortOrder('desc');
        } else {
            setSortBy('default');
            setSortOrder('asc');
        }
    };

    const sortButtonLabel = useMemo(() => {
        if (sortBy === 'title') {
            return sortOrder === 'asc' ? 'Назва (А-Я)' : 'Назва (Я-А)';
        }
        return sortOrder === 'asc' ? 'За замовчуванням (Прямий)' : 'За замовчуванням (Зворотній)';
    }, [sortBy, sortOrder]);

    const handleLoadMore = () => {
        if (hasMore && !isFetching) setPage(prev => prev + 1);
    };

    return (
        <div className="category-tracks-page py-4">
            <div className="container-fluid px-lg-4">

                {/* ─── КОНТЕЙНЕР ХЕДЕРА (ИДЕНТИЧНЫЙ FAVORITES) ────────────────── */}
                <div className="favorites-header">
                    <p className="favorites-header__breadcrumb">Плейліст за категорією</p>
                    <h1 className="favorites-header__title">{categoryTitle}</h1>

                    <div className="favorites-header__meta d-flex align-items-center flex-wrap" style={{ minHeight: '24px' }}>
                        <i className="bi bi-music-note-list me-1 text-accent" />
                        <span className="fw-semibold text-white ms-1">Система Yuviron</span>
                        {totalCount > 0 && (
                            <span className="ms-2 text-muted">• {totalCount} тр.</span>
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
                                        placeholder="Пошук у цій підбірці..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
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

                    {/* Сетка колонок сохранена для идеального визуального выравнивания с TrackRow */}
                    <div className="favorites-header__columns mt-4">
                        <div className="favorites-header__col-index">#</div>
                        <div className="favorites-header__col-title">Назва</div>
                        <div className="favorites-header__col-album d-none d-md-block">Альбом</div>
                        <div className="favorites-header__col-date d-none d-lg-block">Додатково</div>
                        <div className="favorites-header__col-duration"><i className="bi bi-clock" /></div>
                    </div>
                </div>

                {/* ─── СПИСОК ТРЕКОВ НА ОСНОВЕ ЕДИНОГО TRACKROW ───────────────── */}
                <div className="favorites-page__list mt-2">
                    {isLoading && page === 1 ? (
                        <CategoryTracksSkeleton />
                    ) : isError ? (
                        <div className="text-center py-5 text-danger small">
                            Не вдалося завантажити треки. Перевірте з`єднання з сервером.
                        </div>
                    ) : processedTracks.length === 0 ? (
                        <div className="favorites-page__empty text-center py-5">
                            <i className="bi bi-search text-secondary" style={{ fontSize: '2rem' }} />
                            <p className="text-secondary mt-2">Нічого не знайдено</p>
                        </div>
                    ) : (
                        processedTracks.map(track => (
                            <TrackRow
                                key={`${track.id}-${track.isSaved}`}
                                track={track}
                                allTracks={processedTracks}
                            />
                        ))
                    )}
                </div>

                {/* ─── КНОПКА ПОКАЗАТИ ЩЕ ─────────────────────────────────────── */}
                {hasMore && processedTracks.length > 0 && !search.trim() && (
                    <div className="d-flex justify-content-center mt-5">
                        <button
                            className="yuviron-btn-minimal px-5 py-2.5 fw-semibold"
                            onClick={handleLoadMore}
                            disabled={isFetching}
                            style={{ minWidth: '220px' }}
                        >
                            {isFetching ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2 text-cyan" role="status" style={{ width: '14px', height: '14px' }} />
                                    Підзавантаження...
                                </>
                            ) : (
                                'Показати ще'
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const CategoryTracksSkeleton = () => (
    <>
        {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="track-row opacity-50">
                <div className="skeleton" style={{ width: 20, height: 16 }} />
                <div className="d-flex align-items-center gap-3 flex-grow-1">
                    <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 4 }} />
                    <div>
                        <div className="skeleton mb-1" style={{ width: 140, height: 14 }} />
                        <div className="skeleton" style={{ width: 100, height: 12 }} />
                    </div>
                </div>
                <div className="skeleton d-none d-md-block" style={{ width: 120, height: 14 }} />
                <div className="skeleton d-none d-lg-block" style={{ width: 80, height: 14 }} />
                <div className="skeleton" style={{ width: 40, height: 14 }} />
            </div>
        ))}
    </>
);