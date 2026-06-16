'use client';

import { useState, useMemo, useCallback } from 'react';
import { usePlayer } from '@/entities/player/lib/usePlayer';
import { usePlayerStore } from '@/entities/player/model/playerStore';
import type { TrackRowData } from '@/entities/track/ui/TrackRow';

export type CollectionSortField = 'default' | 'title' | 'addedAt';
export type CollectionSortOrder = 'asc' | 'desc';

interface UseTrackCollectionOptions {
    rawTracks: TrackRowData[];
    sourceType: 'Playlist' | 'Album' | 'Search' | 'ArtistProfile';
    sourceId: string;
    defaultSortBy?: CollectionSortField;
    defaultSortOrder?: CollectionSortOrder;
    hideControls?: boolean;
}

export const useTrackCollection = ({
                                       rawTracks,
                                       sourceType,
                                       sourceId,
                                       defaultSortBy = 'default',
                                       defaultSortOrder = 'asc',
                                       hideControls = false,
                                   }: UseTrackCollectionOptions) => {
    const { playQueue, togglePlay } = usePlayer();

    // ─── Состояния поиска и сортировки ───
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<CollectionSortField>(defaultSortBy);
    const [sortOrder, setSortOrder] = useState<CollectionSortOrder>(defaultSortOrder);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);

    // 🌟 БЕЗОПАСНЫЙ СБРОС СТЕЙТА НА ЭТАПЕ РЕНДЕРА (Вместо useEffect)
    // Как только sourceId меняется (перешли с Favorites на Альбом или Категорию), стейты сбрасываются мгновенно
    const [prevSourceId, setPrevSourceId] = useState(sourceId);
    if (sourceId !== prevSourceId) {
        setPrevSourceId(sourceId);
        setSearch('');
        setSortBy(defaultSortBy);
        setSortOrder(defaultSortOrder);
        setIsSearchExpanded(false);
    }

    // ─── Клиентская фильтрация и сортировка ───
    const processedTracks = useMemo(() => {
        if (hideControls) {
            return rawTracks.map((t, idx) => ({ ...t, index: t.index ?? idx + 1 }));
        }

        let result = [...rawTracks];

        // Поиск
        if (search.trim()) {
            const query = search.toLowerCase();
            result = result.filter(t =>
                t.title.toLowerCase().includes(query) ||
                t.artistNames.some(name => name.toLowerCase().includes(query))
            );
        }

        // Сортировка
        result.sort((a, b) => {
            if (sortBy === 'title') {
                return sortOrder === 'asc'
                    ? a.title.localeCompare(b.title)
                    : b.title.localeCompare(a.title);
            }
            if (sortBy === 'addedAt') {
                // Защита от пустых дат или некорректных строк, которые ломали метод .sort()
                const timeA = a.addedAt ? new Date(a.addedAt).getTime() : 0;
                const timeB = b.addedAt ? new Date(b.addedAt).getTime() : 0;

                if (isNaN(timeA) || isNaN(timeB)) return 0;
                return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
            }

            // По умолчанию
            return sortOrder === 'asc' ? a.index - b.index : b.index - a.index;
        });

        return result.map((t, idx) => ({ ...t, index: idx + 1 }));
    }, [rawTracks, search, sortBy, sortOrder, hideControls]);

    // ─── Интеграция со стором плеера ───
    const currentTrackId = usePlayerStore((s) => s.currentTrack?.id);
    const playerStatus   = usePlayerStore((s) => s.status);

    const isCollectionPlaying = useMemo(() => {
        if (playerStatus !== 'playing' || processedTracks.length === 0) return false;
        return processedTracks.some((t) => t.id === currentTrackId);
    }, [processedTracks, currentTrackId, playerStatus]);

    // ─── Хендлеры управления плеером ───
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
                durationMs:  t.durationMs ?? undefined,
            }));
            playQueue(queue, 0, sourceType, sourceId);
        }
    }, [processedTracks, isCollectionPlaying, togglePlay, playQueue, sourceType, sourceId]);

    const handleShufflePlay = useCallback(() => {
        if (processedTracks.length === 0) return;

        const shuffled = [...processedTracks].sort(() => Math.random() - 0.5);
        const queue = shuffled.map((t) => ({
            id:          t.id,
            title:       t.title,
            artistNames: t.artistNames,
            coverUrl:    t.coverUrl,
            durationMs:  t.durationMs ?? undefined,
        }));
        playQueue(queue, 0, sourceType, sourceId);
    }, [processedTracks, playQueue, sourceType, sourceId]);

    // Циклическое переключение сортировки
    const handleSortClick = () => {
        if (sortBy === 'default' || sortBy === 'addedAt') {
            if (sortOrder === 'desc') {
                setSortOrder('asc');
            } else {
                setSortBy('title');
                setSortOrder('asc');
            }
        } else if (sortBy === 'title') {
            if (sortOrder === 'asc') {
                setSortOrder('desc');
            } else {
                setSortBy(defaultSortBy);
                setSortOrder('desc');
            }
        }
    };

    const sortButtonLabel = useMemo(() => {
        if (sortBy === 'title') {
            return sortOrder === 'asc' ? 'Назва (А-Я)' : 'Назва (Я-А)';
        }
        if (sortBy === 'addedAt') {
            return sortOrder === 'desc' ? 'Дата додавання (Нові)' : 'Дата додавання (Старі)';
        }
        return sortOrder === 'asc' ? 'За замовчуванням (Прямий)' : 'За замовчуванням (Зворотній)';
    }, [sortBy, sortOrder]);

    return {
        search,
        setSearch,
        sortOrder,
        isSearchExpanded,
        setIsSearchExpanded,
        processedTracks,
        isCollectionPlaying,
        sortButtonLabel,
        handlePlayAll,
        handleShufflePlay,
        handleSortClick,
    };
};