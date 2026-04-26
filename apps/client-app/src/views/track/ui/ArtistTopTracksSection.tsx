'use client';

import React from 'react';
import Link from 'next/link';
import { TrackRow, type TrackRowData } from '@/entities/track/ui/TrackRow';

interface ArtistTopTracksSectionProps {
    artistId: string;
    artistName: string;
    /** TODO: замінити на хук — useGetApiArtistsIdTopTracks(artistId) */
    tracks?: TrackRowData[];
    isLoading?: boolean;
}

const MOCK_TOP_TRACKS: TrackRowData[] = [
    { id: '1', index: 1, title: 'LALISA',              artistNames: ['LISA'], albumTitle: 'Сінгл',       addedAt: null, durationMs: 186000, coverUrl: null },
    { id: '2', index: 2, title: 'Moonlit Floor (Kiss Me)', artistNames: ['LISA'], albumTitle: 'Сінгл',  addedAt: null, durationMs: 162000, coverUrl: null },
    { id: '3', index: 3, title: 'Rockstar',            artistNames: ['LISA'], albumTitle: 'Alter Ego',  addedAt: null, durationMs: 166000, coverUrl: null },
];

/**
 * Секція: Популярні треки виконавця
 *
 * Підключення даних:
 * 1. const { data, isLoading } = useGetApiArtistsIdTopTracks(artistId);
 * 2. <ArtistTopTracksSection
 *      artistId={artistId}
 *      artistName={artistName}
 *      tracks={data?.items}
 *      isLoading={isLoading}
 *    />
 */
export const ArtistTopTracksSection = ({
                                           artistId,
                                           artistName,
                                           tracks = MOCK_TOP_TRACKS,
                                           isLoading = false,
                                       }: ArtistTopTracksSectionProps) => {
    return (
        <section className="mb-5">
            <div className="mb-1">
                <h2 className="section-header__title">{artistName}</h2>
                <p className="track-page__subtitle">Популярні треки цього виконавця</p>
            </div>

            {isLoading ? (
                <div>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="track-row">
                            <div className="skeleton" style={{ width: 20, height: 16 }} />
                            <div className="d-flex align-items-center gap-3 flex-grow-1">
                                <div className="skeleton" style={{ width: 40, height: 40 }} />
                                <div className="skeleton" style={{ width: 120, height: 14 }} />
                            </div>
                            <div className="skeleton d-none d-md-block" style={{ width: 100, height: 14 }} />
                            <div className="skeleton" style={{ width: 40, height: 14 }} />
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {tracks.map((track) => (
                        <TrackRow
                            key={track.id}
                            track={track}
                            onClick={(id) => console.log('play', id)} // TODO: плеєр
                            onLike={(id) => console.log('like', id)}  // TODO: хук лайку
                        />
                    ))}
                </>
            )}
        </section>
    );
};