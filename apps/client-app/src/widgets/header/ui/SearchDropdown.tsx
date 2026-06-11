'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';

// Real API Hooks & Types
import {
    useGetApiSearch,
    getGetApiSearchQueryKey,
    type GlobalSearchResponse,
    type SearchTrackDto,
    type SearchArtistDto,
    type SearchPlaylistDto,
    type TrackArtistDto
} from '@repo/api/client.ts';
import { getImageUrl } from '@/shared/lib/getImageUrl';

interface SearchResult {
    id: string;
    type: 'track' | 'artist' | 'playlist';
    title: string;
    subtitle?: string;
    coverUrl?: string | null;
}

interface SearchDropdownProps {
    query: string;
    onClose: () => void;
}

const TYPE_ICONS: Record<SearchResult['type'], string> = {
    track:   'bi-music-note',
    artist:  'bi-person',
    playlist:'bi-collection',
};

const getHref = (result: SearchResult): string => {
    if (result.type === 'track')    return `/tracks/${result.id}`;
    if (result.type === 'artist')   return `/artists/${result.id}`;
    if (result.type === 'playlist') return `/playlist/${result.id}`;
    return '#';
};

export const SearchDropdown = ({ query, onClose }: SearchDropdownProps) => {

    // ─── 🚨 ФІКС ДЛЯ TS2741 (Обов'язковий queryKey у конфігу) ────────────────
    const searchQueryParams = { query, limit: 7 };
    const { data: searchRaw, isLoading } = useGetApiSearch(
        searchQueryParams,
        {
            query: {
                enabled: query.trim().length > 0,
                queryKey: getGetApiSearchQueryKey(searchQueryParams),
            },
        }
    );

    // Safe unwrap структури відповіді без використання any
    const searchData = useMemo<GlobalSearchResponse | undefined>(() => {
        if (!searchRaw) return undefined;
        if (typeof searchRaw === 'object' && 'data' in searchRaw) {
            return (searchRaw as { data: GlobalSearchResponse }).data;
        }
        return searchRaw as GlobalSearchResponse;
    }, [searchRaw]);

    // ─── 🚨 ПОВНЕ ВИДАЛЕННЯ ANY ТА СУВОРИЙ МАПІНГ ДЛЯ MIXED СПИСКУ ──────────
    const displayResults = useMemo<SearchResult[]>(() => {
        if (!searchData) return [];

        const combined: SearchResult[] = [];

        // Беремо перші знайдені треки з суворою типізацією SearchTrackDto
        (searchData.tracks ?? []).slice(0, 3).forEach((t: SearchTrackDto) => {
            combined.push({
                id: t.id ?? '',
                type: 'track',
                title: t.title ?? 'Без назви',
                subtitle: t.artists?.map((a: TrackArtistDto) => a.name).join(', ') ?? 'Трек',
                coverUrl: t.coverUrl,
            });
        });

        // Додаємо артистів з суворою типізацією SearchArtistDto
        (searchData.artists ?? []).slice(0, 2).forEach((a: SearchArtistDto) => {
            combined.push({
                id: a.id ?? '',
                type: 'artist',
                title: a.name ?? 'Артист',
                subtitle: 'Виконавець',
                coverUrl: a.avatarUrl,
            });
        });

        // Додаємо топ-плейлісти з суворою типізацією SearchPlaylistDto
        (searchData.playlists ?? []).slice(0, 2).forEach((p: SearchPlaylistDto) => {
            combined.push({
                id: p.id ?? '',
                type: 'playlist',
                title: p.title ?? 'Плейліст',
                subtitle: `Плейліст • ${p.creatorName ?? 'Yuviron'}`,
                coverUrl: p.coverUrl,
            });
        });

        return combined;
    }, [searchData]);

    if (!query.trim()) return null;

    return (
        <div className="search-dropdown">
            {isLoading ? (
                <div className="search-dropdown__loading p-3 text-secondary text-center">
                    <span className="spinner-border spinner-border-sm me-2 text-light" role="status" />
                    Пошук у медіатеці Yuviron...
                </div>
            ) : displayResults.length === 0 ? (
                <div className="search-dropdown__empty p-3 text-secondary text-center">
                    Нічого не знайдено для «{query}»
                </div>
            ) : (
                <ul className="search-dropdown__list list-unstyled mb-0">
                    {displayResults.map((result) => {
                        const coverSrc = getImageUrl(result.coverUrl)
                            ?? `https://picsum.photos/seed/${result.type}-${result.id}/50/50`;

                        return (
                            <li key={`${result.type}-${result.id}`}>
                                <Link
                                    href={getHref(result)}
                                    className="search-dropdown__item d-flex align-items-center gap-3 p-2 text-decoration-none"
                                    onClick={onClose}
                                >
                                    <div
                                        className={`search-dropdown__cover ${result.type === 'artist' ? 'search-dropdown__cover--round' : ''}`}
                                        style={{ width: 40, height: 40, flexShrink: 0, overflow: 'hidden', borderRadius: result.type === 'artist' ? '50%' : '4px' }}
                                    >
                                        <img src={coverSrc} alt={result.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div className="search-dropdown__info flex-grow-1 d-flex flex-column text-truncate">
                                        <span className="search-dropdown__title text-white fw-medium text-truncate small">{result.title}</span>
                                        {result.subtitle && (
                                            <span className="search-dropdown__subtitle text-muted text-truncate" style={{ fontSize: '0.75rem' }}>{result.subtitle}</span>
                                        )}
                                    </div>
                                    <i className={`bi ${TYPE_ICONS[result.type]} text-secondary`} style={{ fontSize: '1rem' }} />
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}

            {/* Перейти на повний пошук */}
            {!isLoading && displayResults.length > 0 && (
                <Link
                    href={`/search?q=${encodeURIComponent(query)}`}
                    className="search-dropdown__see-all d-block text-center py-2 text-decoration-none border-top border-secondary-subtle small text-white-50"
                    onClick={onClose}
                >
                    Показати всі результаты для «{query}»
                    <i className="bi bi-arrow-right ms-2" />
                </Link>
            )}
        </div>
    );
};