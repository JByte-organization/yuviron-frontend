'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// Real API Hooks, Helpers & Types
import {
    useGetApiSearch,
    getGetApiSearchQueryKey,
    type SearchTrackDto,
    type TrackArtistDto,
    type SearchArtistDto,
    type SearchAlbumDto,
    type SearchPlaylistDto,
    type SearchGenreMoodDto,
    type GlobalSearchResponse
} from '@repo/api/client.ts';

import { getImageUrl } from '@/shared/lib/getImageUrl';

// UI Components
import { ArtistCard } from '@/entities/artist/ui/ArtistCard';
import { AlbumCard } from '@/entities/album/ui/AlbumCard';
import { PlaylistCard } from '@/entities/playlist/ui/PlaylistCard';
import { TrackRow, type TrackRowData } from '@/entities/track/ui/TrackRow';
import { GenreCard } from '@/entities/genre/ui/GenreCard';
import { SEARCH_FILTERS, type SearchFilter } from './model/types';

// Інтерфейси для суворого мапінгу результатів пошуку
interface MappedArtist { id: string; name: string; avatarUrl: string | null; isFollowed: boolean; }
interface MappedAlbum { id: string; title: string; coverUrl: string | null; artistName: string; releaseYear?: number; }
interface MappedPlaylist { id: string; name: string; coverUrl: string | null; creatorName: string; }
interface MappedGenre { id: string; name: string; iconUrl: string | null; }

const SearchContent = () => {
    const searchParams = useSearchParams();
    const q = searchParams?.get('q') ?? '';

    const [filter, setFilter] = useState<SearchFilter>('all');

    // Синхронний скид табів при зміні пошукового слова q
    const [prevQ, setPrevQ] = useState(q);
    if (q !== prevQ) {
        setPrevQ(q);
        setFilter('all');
    }

    const searchQueryParams = { query: q, limit: 20 };
    const { data: searchRaw, isLoading } = useGetApiSearch(
        searchQueryParams,
        {
            query: {
                enabled: q.trim().length > 0,
                queryKey: getGetApiSearchQueryKey(searchQueryParams),
            },
        }
    );

    // 🚨 ФІКС №2: ЗАЛІЗОБЕТОННИЙ АНВРАППЕР ДАННИХ
    // Сканує шари відповіді на наявність ключів пошуку, захищаючи від будь-яких мутацій API
    const searchData = useMemo<GlobalSearchResponse | undefined>(() => {
        if (!searchRaw) return undefined;

        const raw = searchRaw as any;

        // Варіант А: Обгортка другого рівня (raw.data.data.tracks)
        if (raw.data?.data && (raw.data.data.tracks || raw.data.data.artists || raw.data.data.playlists)) {
            return raw.data.data as GlobalSearchResponse;
        }

        // Варіант Б: Стандартна обгортка першого рівня (raw.data.tracks)
        if (raw.data && (raw.data.tracks || raw.data.artists || raw.data.playlists)) {
            return raw.data as GlobalSearchResponse;
        }

        // Варіант В: Чисті дані лежать на самому верхньому рівні відповіді
        return raw as GlobalSearchResponse;
    }, [searchRaw]);

    // Суворий мапінг отриманих масивів
    const results = useMemo(() => {
        const tracks: TrackRowData[] = (searchData?.tracks ?? []).map((t: SearchTrackDto, i: number) => ({
            id:          t.id ?? '',
            index:       i + 1,
            title:       t.title ?? 'Без назви',
            artistNames: t.artists?.map((a: TrackArtistDto) => a.name ?? '') ?? [],
            coverUrl:    getImageUrl(t.coverUrl),
            isSaved:     t.isSaved ?? false,
            albumTitle:  undefined,
        }));

        const artists: MappedArtist[] = (searchData?.artists ?? []).map((a: SearchArtistDto) => ({
            id:        a.id ?? '',
            name:      a.name ?? 'Невідомий виконавець',
            avatarUrl: getImageUrl(a.avatarUrl),
            isFollowed: a.isFollowed ?? false,
        }));

        const albums: MappedAlbum[] = (searchData?.albums ?? []).map((al: SearchAlbumDto) => ({
            id:         al.id ?? '',
            title:      al.title ?? 'Без назви',
            coverUrl:   getImageUrl(al.coverUrl),
            artistName: al.artists?.map((a: TrackArtistDto) => a.name).join(', ') ?? 'Невідомий виконавець',
            releaseYear: al.releaseYear,
        }));

        const playlists: MappedPlaylist[] = (searchData?.playlists ?? []).map((p: SearchPlaylistDto) => ({
            id:          p.id ?? '',
            name:        p.title ?? 'Без назви',
            coverUrl:    getImageUrl(p.coverUrl),
            creatorName: p.creatorName ?? 'Користувач',
        }));

        const genres: MappedGenre[] = (searchData?.genres ?? []).map((g: SearchGenreMoodDto) => ({
            id:      g.id ?? '',
            name:    g.name ?? '',
            iconUrl: getImageUrl(g.coverUrl),
        }));

        return { tracks, artists, albums, playlists, genres };
    }, [searchData]);

    const counts: Record<SearchFilter, number> = useMemo(() => {
        if (!q.trim()) return { all: 0, tracks: 0, artists: 0, albums: 0, playlists: 0, genres: 0 };
        return {
            all:       Object.values(results).reduce((sum, arr) => sum + arr.length, 0),
            tracks:    results.tracks.length,
            artists:   results.artists.length,
            albums:    results.albums.length,
            playlists: results.playlists.length,
            genres:    results.genres.length,
        };
    }, [results, q]);

    const isEmpty = !isLoading && (counts.all === 0 || !q.trim());

    return (
        <div className="search-page">
            <div className="search-page__header">
                <h1 className="search-page__title">
                    {q ? `Результати для «${q}»` : 'Пошук'}
                </h1>
                {counts.all > 0 && (
                    <p className="search-page__count">
                        Знайдено {counts.all} результатів
                    </p>
                )}
            </div>

            <div className="search-page__filters">
                {SEARCH_FILTERS.map((f) => (
                    <button
                        key={f.key}
                        className={`search-page__filter-btn${filter === f.key ? ' search-page__filter-btn--active' : ''}`}
                        onClick={() => setFilter(f.key)}
                    >
                        {f.label}
                        {counts[f.key] > 0 && f.key !== 'all' && (
                            <span className="search-page__filter-count">{counts[f.key]}</span>
                        )}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <SearchSkeleton />
            ) : isEmpty ? (
                <div className="search-page__empty">
                    <i className="bi bi-search" />
                    <p>{q ? `Нічого не знайдено для «${q}»` : 'Введіть ваш пошуковий запит'}</p>
                    <span>Перевірте написання або спробуйте ввести назву треку чи ім'я виконавця</span>
                </div>
            ) : (
                <div className="search-page__results">
                    {/* Треки */}
                    {(filter === 'all' || filter === 'tracks') && results.tracks.length > 0 && (
                        <section className="search-page__section">
                            {filter === 'all' && <h2 className="search-page__section-title">Треки</h2>}
                            <div className="search-page__tracks">
                                {results.tracks.map((track) => (
                                    <TrackRow
                                        key={`${track.id}-${track.isSaved}`}
                                        track={track}
                                        allTracks={results.tracks}
                                        sourceType="Search"
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Виконавці */}
                    {(filter === 'all' || filter === 'artists') && results.artists.length > 0 && (
                        <section className="search-page__section">
                            {filter === 'all' && <h2 className="search-page__section-title">Виконавці</h2>}
                            <div className="row g-3">
                                {results.artists.map((artist) => (
                                    <div key={artist.id} className="col-6 col-md-4 col-lg-3 col-xl-2">
                                        <ArtistCard artist={artist} />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Альбоми */}
                    {(filter === 'all' || filter === 'albums') && results.albums.length > 0 && (
                        <section className="search-page__section">
                            {filter === 'all' && <h2 className="search-page__section-title">Альбоми</h2>}
                            <div className="row g-3">
                                {results.albums.map((album) => (
                                    <div key={album.id} className="col-6 col-md-4 col-lg-3 col-xl-2">
                                        <AlbumCard album={album} />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Плейлісти */}
                    {(filter === 'all' || filter === 'playlists') && results.playlists.length > 0 && (
                        <section className="search-page__section">
                            {filter === 'all' && <h2 className="search-page__section-title">Плейлісти</h2>}
                            <div className="row g-3">
                                {results.playlists.map((playlist) => (
                                    <div key={playlist.id} className="col-6 col-md-4 col-lg-3 col-xl-2">
                                        <PlaylistCard playlist={playlist} />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Жанри і настрої */}
                    {(filter === 'all' || filter === 'genres') && results.genres.length > 0 && (
                        <section className="search-page__section">
                            {filter === 'all' && <h2 className="search-page__section-title">Жанри і настрої</h2>}
                            <div className="row g-3">
                                {results.genres.map((genre) => (
                                    <div key={genre.id} className="col-6 col-md-4 col-lg-3 col-xl-2">
                                        <GenreCard genre={genre} />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
};

export const SearchPage = () => {
    return (
        <Suspense fallback={<SearchSkeleton />}>
            <SearchContent />
        </Suspense>
    );
};

const SearchSkeleton = () => (
    <div className="search-page">
        <div className="d-flex gap-2 mb-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 36, width: 100, borderRadius: 20 }} />
            ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="track-row mb-2 opacity-50">
                <div className="skeleton" style={{ width: 20, height: 16 }} />
                <div className="d-flex align-items-center gap-3 flex-grow-1">
                    <div className="skeleton" style={{ width: 40, height: 40, flexShrink: 0 }} />
                    <div>
                        <div className="skeleton mb-1" style={{ width: 140, height: 14 }} />
                        <div className="skeleton" style={{ width: 100, height: 12 }} />
                    </div>
                </div>
                <div className="skeleton d-none d-md-block" style={{ width: 120, height: 14 }} />
                <div className="skeleton" style={{ width: 40, height: 14 }} />
            </div>
        ))}
    </div>
);