'use client';

import React, { useState } from 'react';
import { TrackRow, type TrackRowData } from '@/entities/track/ui/TrackRow';

interface TrackRecommendationsSectionProps {
    /** TODO: замінити на хук — useGetApiTracksIdRecommendations(trackId) */
    tracks?: TrackRowData[];
    isLoading?: boolean;
}

const MOCK_RECOMMENDATIONS: TrackRowData[] = [
    { id: '1', index: 1, title: 'How You Like That', artistNames: ['BLACKPINK'], albumTitle: 'THE ALBUM',   addedAt: null, durationMs: 154000, coverUrl: null },
    { id: '2', index: 2, title: 'Ice Cream',         artistNames: ['BLACKPINK'], albumTitle: 'THE ALBUM',   addedAt: null, durationMs: 182000, coverUrl: null },
    { id: '3', index: 3, title: 'Bet Yiu Wanna',     artistNames: ['BLACKPINK'], albumTitle: 'THE ALBUM',   addedAt: null, durationMs: 182000, coverUrl: null },
    { id: '4', index: 4, title: 'Rockstar',          artistNames: ['LISA'],      albumTitle: 'Alter Ego',   addedAt: null, durationMs: 166000, coverUrl: null },
    { id: '5', index: 5, title: 'Thunder',           artistNames: ['LISA'],      albumTitle: 'Alter Ego',   addedAt: null, durationMs: 162000, coverUrl: null },
    { id: '6', index: 6, title: 'LALISA',            artistNames: ['LISA'],      albumTitle: 'Сінгл',       addedAt: null, durationMs: 186000, coverUrl: null },
    { id: '7', index: 7, title: 'Money',             artistNames: ['LISA'],      albumTitle: 'Сінгл',       addedAt: null, durationMs: 172000, coverUrl: null },
];

const INITIAL_COUNT = 5;

/**
 * Секція: Рекомендації на основі треку
 *
 * Підключення даних:
 * 1. const { data, isLoading } = useGetApiTracksIdRecommendations(trackId);
 * 2. <TrackRecommendationsSection tracks={data?.items} isLoading={isLoading} />
 */
export const TrackRecommendationsSection = ({
                                                tracks = MOCK_RECOMMENDATIONS,
                                                isLoading = false,
                                            }: TrackRecommendationsSectionProps) => {
    const [showAll, setShowAll] = useState(false);

    const visibleTracks = showAll ? tracks : tracks.slice(0, INITIAL_COUNT);
    const hasMore = tracks.length > INITIAL_COUNT;

    return (
        <section className="mb-5">
            <div className="mb-1">
                <h2 className="section-header__title">Рекомендації</h2>
                <p className="track-page__subtitle">На основі цього треку</p>
            </div>

            {isLoading ? (
                <RecommendationsSkeleton />
            ) : (
                <>
                    {visibleTracks.map((track) => (
                        <TrackRow
                            key={track.id}
                            track={track}
                            onClick={(id) => console.log('play', id)} // TODO: плеєр
                            onLike={(id) => console.log('like', id)}  // TODO: хук лайку
                        />
                    ))}

                    {/* Показати ще */}
                    {hasMore && (
                        <button
                            className="track-page__show-more"
                            onClick={() => setShowAll((v) => !v)}
                        >
                            {showAll ? 'Згорнути' : 'Показати ще...'}
                        </button>
                    )}
                </>
            )}
        </section>
    );
};

const RecommendationsSkeleton = () => (
    <>
        {Array.from({ length: 5 }).map((_, i) => (
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
                <div className="skeleton" style={{ width: 40, height: 14 }} />
            </div>
        ))}
    </>
);