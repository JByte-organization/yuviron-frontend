'use client';

import React, { useState, useMemo } from 'react';
import { FavoritesHeader } from './ui/FavoritesHeader';
import { TrackRow, type TrackRowData } from '@/entities/track/ui/TrackRow';
import { useGetApiMeFavoritesTracks, type UserFavoriteTrackDto, type TrackArtistDto } from '@repo/api/client.ts';
import { getImageUrl } from '@/shared/lib/getImageUrl';
import { UserFavoriteTrackDtoPaginatedList } from "@repo/api/generated/client/models";

export type SortField = 'addedAt' | 'title';
export type SortOrder = 'asc' | 'desc';

export const FavoritesPage = () => {
    // ─── СТЕЙТИ КЕРУВАННЯ СПИСКОМ ──────────────────────────────────────────
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<SortField>('addedAt');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    const { data: favoritesRaw, isLoading } = useGetApiMeFavoritesTracks({
        PageSize: 100,
    });

    // ─── 1. ПЕРВИННИЙ МАПІНГ ДАННИХ З БЕКЕНДУ ──────────────────────────────
    const rawTracks: TrackRowData[] = useMemo(() => {
        const paginated = favoritesRaw as UserFavoriteTrackDtoPaginatedList | undefined;
        const items = paginated?.items ?? [];

        return items.map((t: UserFavoriteTrackDto, i: number) => ({
            id:          t.trackId   ?? '',
            index:       i + 1,
            title:       t.title     ?? '',
            artistNames: (t.artistNames ?? []).map((a: TrackArtistDto) => a.name ?? ''),
            albumId:     t.albumId,
            albumTitle:  t.albumTitle,
            addedAt:     t.savedAt,
            durationMs:  t.durationMs,
            coverUrl:    getImageUrl(t.coverUrl),
            isSaved:     true,
        }));
    }, [favoritesRaw]);

    // ─── 2. КЛІЄНТСЬКИЙ ПОШУК ТА СОРТУВАННЯ (ОПТИМІЗОВАНО) ─────────────────
    const processedTracks = useMemo(() => {
        let result = [...rawTracks];

        // Фільтрація по пошуковому запиту (назва треку або ім'я артиста)
        if (search.trim()) {
            const query = search.toLowerCase();
            result = result.filter(t =>
                t.title.toLowerCase().includes(query) ||
                t.artistNames.some(name => name.toLowerCase().includes(query))
            );
        }

        // Сортування списку
        result.sort((a, b) => {
            if (sortBy === 'title') {
                return sortOrder === 'asc'
                    ? a.title.localeCompare(b.title)
                    : b.title.localeCompare(a.title);
            }

            // За замовчуванням: за датою додавання (addedAt)
            const dateA = a.addedAt ? new Date(a.addedAt).getTime() : 0;
            const dateB = b.addedAt ? new Date(b.addedAt).getTime() : 0;
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });

        // Перераховуємо відображувані індекси (#) після фільтрації/сортування
        return result.map((t, idx) => ({ ...t, index: idx + 1 }));
    }, [rawTracks, search, sortBy, sortOrder]);

    return (
        <div className="favorites-page">
            {/* Передаємо стейти та колбєки в шапку */}
            <FavoritesHeader
                tracks={processedTracks}
                search={search}
                onSearchChange={setSearch}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}
            />

            <div className="favorites-page__list">
                {isLoading ? (
                    <FavoritesSkeleton />
                ) : processedTracks.length === 0 ? (
                    <div className="favorites-page__empty text-center py-5">
                        <i className="bi bi-heart text-secondary" style={{ fontSize: '2rem' }} />
                        <p className="text-secondary mt-2">Нічого не знайдено</p>
                    </div>
                ) : (
                    processedTracks.map(track => (
                        <TrackRow
                            // Суворий комбінований ключ змусить React миттєво прибрати трек, якщо його статус зміниться
                            key={`${track.id}-${track.isSaved}`}
                            track={track}
                            allTracks={processedTracks}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

const FavoritesSkeleton = () => (
    <>
        {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="track-row opacity-50">
                <div className="skeleton" style={{ width: 20, height: 16 }} />
                <div className="d-flex align-items-center gap-3 flex-grow-1">
                    <div className="skeleton" style={{ width: 40, height: 40, flexShrink: 0 }} />
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