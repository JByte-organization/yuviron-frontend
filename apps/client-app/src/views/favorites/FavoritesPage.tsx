'use client';

import React from 'react';
import { FavoritesHeader } from './ui/FavoritesHeader';
import { TrackRow, type TrackRowData } from '@/entities/track/ui/TrackRow';

// ─── Mock дані ────────────────────────────────────────────
// TODO: замінити на хук — useGetApiUserFavorites()
const MOCK_TRACKS: TrackRowData[] = [
    { id: '1',  index: 1,  title: 'ВИМОЛИВ',            artistNames: ['KALUSH', 'Ingrity Rhimes'], artistId: 'kalush', albumTitle: 'ВИМОЛИВ',                  addedAt: new Date().toISOString(),                              durationMs: 182000, coverUrl: null },
    { id: '2',  index: 2,  title: 'Для моєї душі',       artistNames: ['Skofka'],                  artistId: 'Skofka',  albumTitle: 'Струни моєї душі',          addedAt: new Date().toISOString(),                              durationMs: 176000, coverUrl: null },
    { id: '3',  index: 3,  title: 'Remember me',         artistNames: ['Night Riots'],             artistId: 'NightRiots', albumTitle: 'Harmonic Convergence',      addedAt: new Date().toISOString(),                              durationMs: 163000, coverUrl: null },
    { id: '4',  index: 4,  title: 'Solo',                artistNames: ['MOLIN PAN'],               artistId: 'MOLINPAN', albumTitle: 'G I R L',                   addedAt: new Date().toISOString(),                              durationMs: 94000,  coverUrl: null },
    { id: '5',  index: 5,  title: 'How You Like That',   artistNames: ['BLACKPINK'],               artistId: 'BLACKPINK',  albumTitle: 'THE ALBUM',                 addedAt: new Date().toISOString(),                              durationMs: 154000, coverUrl: null },
    { id: '6',  index: 6,  title: 'Ice Cream',           artistNames: ['BLACKPINK'],               artistId: 'BLACKPINK',  albumTitle: 'THE ALBUM',                 addedAt: new Date(Date.now() - 24 * 86400000).toISOString(),    durationMs: 182000, coverUrl: null },
    { id: '7',  index: 7,  title: 'Bet Yiu Wanna',       artistNames: ['BLACKPINK'],               artistId: 'BLACKPINK',  albumTitle: 'THE ALBUM',                 addedAt: new Date(Date.now() - 24 * 86400000).toISOString(),    durationMs: 182000, coverUrl: null },
    { id: '8',  index: 8,  title: 'TOMBOY',              artistNames: ['(G)I-DLE'],                artistId: 'kalush',  albumTitle: '100% (G)I-DLE',             addedAt: '2025-04-02T00:00:00Z',                                durationMs: 202000, coverUrl: null },
    { id: '9',  index: 9,  title: 'LION',                artistNames: ['(G)I-DLE'],                artistId: 'kalush',  albumTitle: '100% (G)I-DLE',             addedAt: '2025-04-02T00:00:00Z',                                durationMs: 225000, coverUrl: null },
    { id: '10', index: 10, title: 'JEALOUSY',            artistNames: ['Oliveri', "Conan O'Brien"],artistId: 'kalush', albumTitle: 'JEALOUSY',                  addedAt: '2025-03-23T00:00:00Z',                                durationMs: 202000, coverUrl: null },
    { id: '11', index: 11, title: 'I Like It',           artistNames: ['Cardi B'],                 artistId: 'Cardi B', albumTitle: 'Invasion of Privacy',       addedAt: '2025-03-23T00:00:00Z',                                durationMs: 192000, coverUrl: null },
    { id: '12', index: 12, title: 'Up',                  artistNames: ['Cardi B'],                 artistId: 'kalush',  albumTitle: 'Invasion of Privacy',       addedAt: '2025-03-22T00:00:00Z',                                durationMs: 71000,  coverUrl: null },
    { id: '13', index: 13, title: 'WAP',                 artistNames: ['Cardi B', 'Bruno Mars'],   artistId: 'kalush', albumTitle: 'Invasion of Privacy',       addedAt: '2025-03-12T00:00:00Z',                                durationMs: 168000, coverUrl: null },
    { id: '14', index: 14, title: 'When I Was Your Man', artistNames: ['Bruno Mars'],              artistId: 'kalush',  albumTitle: 'Unorthodox Jukebox',        addedAt: '2025-03-12T00:00:00Z',                                durationMs: 163000, coverUrl: null },
    { id: '15', index: 15, title: 'Die With A Smile',    artistNames: ['Lady Gaga', 'Bruno Mars'], artistId: 'kalush',  albumTitle: 'Die With A Smile',          addedAt: '2025-03-12T00:00:00Z',                                durationMs: 250000, coverUrl: null },
];

/**
 * Сторінка: Улюблені треки
 *
 * Підключення даних:
 * 1. const { data, isLoading } = useGetApiUserFavorites();
 * 2. Замінити MOCK_TRACKS на data?.items
 */
export const FavoritesPage = () => {
    // TODO: замінити на хук
    const tracks = MOCK_TRACKS;
    const isLoading = false;

    return (
        <div className="favorites-page">
            <FavoritesHeader tracksCount={tracks.length} />

            <div className="favorites-page__list">
                {isLoading ? (
                    <FavoritesSkeleton />
                ) : tracks.length === 0 ? (
                    <div className="favorites-page__empty">
                        <i className="bi bi-heart" />
                        <p>Улюблених треків поки немає</p>
                    </div>
                ) : (
                    tracks.map((track) => (
                        <TrackRow
                            key={track.id}
                            track={track}
                            onClick={(id) => console.log('play', id)} // TODO: плеєр
                            onLike={(id) => console.log('like', id)}  // TODO: хук лайку
                        />
                    ))
                )}
            </div>
        </div>
    );
};

const FavoritesSkeleton = () => (
    <>
        {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="track-row">
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