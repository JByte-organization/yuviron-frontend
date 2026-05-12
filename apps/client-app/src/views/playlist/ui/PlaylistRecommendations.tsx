'use client';

import React, { useState } from 'react';
import { TrackRow, type TrackRowData } from '@/entities/track/ui/TrackRow';

interface PlaylistRecommendationsProps {
    playlistId: string;
    isOwner: boolean;
    onAddToPlaylist: (trackId: string, title: string) => void;
}

// ─── Mock ──────────────────────────────────────────────────
// TODO: замінити на useGetApiPlaylistsIdRecommendations(playlistId)
const MOCK_RECOMMENDATIONS: TrackRowData[] = [
    { id: 'r1', index: 1, title: 'LION',          artistNames: ['(G)I-DLE'],  artistId: 'gidle',  albumId: 'ra1', albumTitle: '100% (G)I-DLE', addedAt: null, durationMs: 225000, coverUrl: null },
    { id: 'r2', index: 2, title: 'JEALOUSY',      artistNames: ['Oliveri'],   artistId: 'olv',    albumId: 'ra2', albumTitle: 'JEALOUSY',      addedAt: null, durationMs: 202000, coverUrl: null },
    { id: 'r3', index: 3, title: 'I Like It',     artistNames: ['Cardi B'],   artistId: 'cardi',  albumId: 'ra3', albumTitle: 'Invasion of Privacy', addedAt: null, durationMs: 192000, coverUrl: null },
    { id: 'r4', index: 4, title: 'Up',            artistNames: ['Cardi B'],   artistId: 'cardi',  albumId: 'ra3', albumTitle: 'Invasion of Privacy', addedAt: null, durationMs: 71000,  coverUrl: null },
    { id: 'r5', index: 5, title: 'APT.',          artistNames: ['ROSÉ', 'Bruno Mars'], artistId: 'rose', albumId: 'ra4', albumTitle: 'Invasion of Privacy', addedAt: null, durationMs: 168000, coverUrl: null },
    { id: 'r6', index: 6, title: 'When I Was Your Man', artistNames: ['Bruno Mars'], artistId: 'bruno', albumId: 'ra5', albumTitle: 'Unorthodox Jukebox', addedAt: null, durationMs: 163000, coverUrl: null },
    { id: 'r7', index: 7, title: 'Die With A Smile', artistNames: ['Lady Gaga', 'Bruno Mars'], artistId: 'gaga', albumId: 'ra6', albumTitle: 'Die With A Smile', addedAt: null, durationMs: 250000, coverUrl: null },
    { id: 'r8', index: 8, title: 'Shallow',       artistNames: ['Lady Gaga', 'Bradley Cooper'], artistId: 'gaga', albumId: 'ra7', albumTitle: 'A Star Is Born', addedAt: null, durationMs: 216000, coverUrl: null },
];

export const PlaylistRecommendations = ({
                                            playlistId,
                                            isOwner,
                                            onAddToPlaylist,
                                        }: PlaylistRecommendationsProps) => {
    const [tracks, setTracks] = useState<TrackRowData[]>(MOCK_RECOMMENDATIONS);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        // TODO: викликати useGetApiPlaylistsIdRecommendations з refetch
        await new Promise((r) => setTimeout(r, 800)); // mock затримка
        // Перемішуємо для демонстрації
        setTracks((prev) => [...prev].sort(() => Math.random() - 0.5));
        setIsRefreshing(false);
    };

    return (
        <section className="playlist-recommendations">
            <div className="playlist-recommendations__header">
                <div>
                    <h2 className="section-header__title">Рекомендації</h2>
                    <p className="playlist-recommendations__subtitle">
                        На основі ваших вподобань
                    </p>
                </div>

                <button
                    className="playlist-recommendations__refresh-btn"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    aria-label="Оновити рекомендації"
                >
                    <i className={`bi bi-arrow-clockwise${isRefreshing ? ' playlist-recommendations__spin' : ''}`} />
                    Оновити
                </button>
            </div>

            <div className="playlist-recommendations__list">
                {tracks.map((track) => (
                    <TrackRow
                        key={track.id}
                        track={track}
                        onClick={(id) => console.log('play', id)}
                        onLike={(id) => console.log('like', id)}
                        onAddToPlaylist={isOwner
                            ? (id) => onAddToPlaylist(id, track.title)
                            : undefined
                        }
                        showAddToPlaylist={isOwner}
                    />
                ))}
            </div>
        </section>
    );
};