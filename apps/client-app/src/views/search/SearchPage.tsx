'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArtistCard } from '@/entities/artist/ui/ArtistCard';
import { AlbumCard } from '@/entities/album/ui/AlbumCard';
import { PlaylistCard } from '@/entities/playlist/ui/PlaylistCard';
import { TrackRow } from '@/entities/track/ui/TrackRow';
import { GenreCard } from '@/entities/genre/ui/GenreCard';
import { MOCK_SEARCH_RESULTS } from './model/mockData';
import { SEARCH_FILTERS, type SearchFilter, type SearchResults } from './model/types';

/**
 * Сторінка: Пошук /search?q=query
 *
 * Підключення даних:
 * 1. const { data, isLoading } = useGetApiSearch({ query: q, filter });
 * 2. Замінити MOCK_SEARCH_RESULTS на data
 */
export const SearchPage = () => {
    const searchParams = useSearchParams();
    const q = searchParams?.get('q') ?? '';

    const [filter, setFilter] = useState<SearchFilter>('all');
    const isLoading = false;

    // TODO: замінити на хук — useGetApiSearch({ query: q, filter })
    const results: SearchResults = MOCK_SEARCH_RESULTS;

    // При зміні query — скидаємо фільтр на "all"
    useEffect(() => {
        setFilter('all');
    }, [q]);

    // ─── Підрахунок результатів для кожного табу ──────────
    const counts: Record<SearchFilter, number> = {
        all:       Object.values(results).reduce((sum, arr) => sum + arr.length, 0),
        tracks:    results.tracks.length,
        artists:   results.artists.length,
        albums:    results.albums.length,
        playlists: results.playlists.length,
        genres:    results.genres.length,
    };

    const isEmpty = counts.all === 0;

    return (
        <div className="search-page">

            {/* ─── Заголовок ────────────────────────────── */}
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

            {/* ─── Фільтр таби ──────────────────────────── */}
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

            {/* ─── Контент ──────────────────────────────── */}
            {isLoading ? (
                <SearchSkeleton />
            ) : isEmpty ? (
                <div className="search-page__empty">
                    <i className="bi bi-search" />
                    <p>Нічого не знайдено для «{q}»</p>
                    <span>Спробуйте інший запит або перевірте написання</span>
                </div>
            ) : (
                <div className="search-page__results">

                    {/* ─── Треки ──────────────────────── */}
                    {(filter === 'all' || filter === 'tracks') && results.tracks.length > 0 && (
                        <section className="search-page__section">
                            {filter === 'all' && (
                                <h2 className="search-page__section-title">Треки</h2>
                            )}
                            <div className="search-page__tracks">
                                {results.tracks.map((track, index) => (
                                    <TrackRow
                                        key={track.id}
                                        track={{
                                            ...track,
                                            index: index + 1,
                                            addedAt: null,
                                        }}
                                        onClick={(id) => console.log('play', id)} // TODO: плеєр
                                        onLike={(id) => console.log('like', id)}  // TODO: хук
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ─── Виконавці ──────────────────── */}
                    {(filter === 'all' || filter === 'artists') && results.artists.length > 0 && (
                        <section className="search-page__section">
                            {filter === 'all' && (
                                <h2 className="search-page__section-title">Виконавці</h2>
                            )}
                            <div className="row g-3">
                                {results.artists.map((artist) => (
                                    <div key={artist.id} className="col-6 col-md-4 col-lg-3 col-xl-2">
                                        <ArtistCard artist={artist} />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ─── Альбоми ────────────────────── */}
                    {(filter === 'all' || filter === 'albums') && results.albums.length > 0 && (
                        <section className="search-page__section">
                            {filter === 'all' && (
                                <h2 className="search-page__section-title">Альбоми</h2>
                            )}
                            <div className="row g-3">
                                {results.albums.map((album) => (
                                    <div key={album.id} className="col-6 col-md-4 col-lg-3 col-xl-2">
                                        <AlbumCard album={album} />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ─── Плейлісти ──────────────────── */}
                    {(filter === 'all' || filter === 'playlists') && results.playlists.length > 0 && (
                        <section className="search-page__section">
                            {filter === 'all' && (
                                <h2 className="search-page__section-title">Плейлісти</h2>
                            )}
                            <div className="row g-3">
                                {results.playlists.map((playlist) => (
                                    <div key={playlist.id} className="col-6 col-md-4 col-lg-3 col-xl-2">
                                        <PlaylistCard playlist={playlist} />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ─── Жанри і настрої ────────────── */}
                    {(filter === 'all' || filter === 'genres') && results.genres.length > 0 && (
                        <section className="search-page__section">
                            {filter === 'all' && (
                                <h2 className="search-page__section-title">Жанри і настрої</h2>
                            )}
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

const SearchSkeleton = () => (
    <div>
        <div className="d-flex gap-2 mb-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 36, width: 100, borderRadius: 20 }} />
            ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="track-row mb-2">
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