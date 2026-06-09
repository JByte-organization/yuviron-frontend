'use client';

import React, { useState, useMemo } from 'react';
import { useGetApiTracksIdRecommendations, getGetApiTracksIdRecommendationsQueryKey, type RecommendedTrackDto } from '@repo/api/client';
import { TrackRow, type TrackRowData } from '@/entities/track/ui/TrackRow';

interface TrackRecommendationsSectionProps {
    trackId: string;
}

interface OrvalResponseWrapper<T> {
    data?: T;
}

// ФІКС TS2430: Вирізаємо durationMs з базового DTO перед розширенням, щоб уникнути конфлікту типів
interface ExtendedRecommendedTrack extends Omit<RecommendedTrackDto, 'durationMs'> {
    durationMs?: number | null;
    durationSeconds?: number | null;
    playsCount?: number | null;
    isLiked?: boolean;
    albumTitle?: string | null;
    albumId?: string | null;
}

const INITIAL_COUNT = 5;

export const TrackRecommendationsSection = ({ trackId }: TrackRecommendationsSectionProps) => {
    const [showAll, setShowAll] = useState(false);

    // Отримуємо список рекомендацій із передачею обов'язкового queryKey
    const { data: rawRecommendations, isLoading } = useGetApiTracksIdRecommendations(
        trackId,
        { limit: 10 },
        {
            query: {
                enabled: !!trackId,
                queryKey: getGetApiTracksIdRecommendationsQueryKey(trackId, { limit: 10 })
            }
        }
    );

    // Безпечне мапування моделей бекенду без використання any та конфліктів типів
    // Безпечне мапування моделей бекенду без використання any та помилок TS2352
    const mappedTracks = useMemo<TrackRowData[]>(() => {
        if (!rawRecommendations) return [];

        // ФІКС TS2352: Пропускаємо через unknown, щоб TypeScript дозволив нам безпечно розібрати юніон відповіді
        const response = rawRecommendations as unknown as { status: number; data: ExtendedRecommendedTrack[] };

        // Якщо сервер повернув 200 і всередині дійсно масив даних — мапимо його
        if (response.status === 200 && Array.isArray(response.data)) {
            return response.data.map((track, index) => {
                const artistNames = track.artists?.map(a => a.name ?? 'Невідомий виконавець') ?? ['Невідомий виконавець'];

                let calculatedDuration: number | null = null;
                if (track.durationMs) {
                    calculatedDuration = track.durationMs;
                } else if (track.durationSeconds) {
                    calculatedDuration = track.durationSeconds * 1000;
                }

                return {
                    id:          track.id ?? '',
                    index:       index + 1,
                    title:       track.title ?? 'Без назви',
                    artistNames,
                    artistId:    track.artists?.[0]?.id,
                    albumId:     track.albumId ?? undefined,
                    albumTitle:  track.albumTitle ?? '—',
                    addedAt:     null,
                    durationMs:  calculatedDuration,
                    coverUrl:    track.coverUrl,
                    playsCount:  track.playsCount ?? 0,
                    isLiked:     track.isLiked ?? false,
                };
            });
        }

        // Якщо прилетів 404 або інший статус — просто повертаємо порожній список треків
        return [];
    }, [rawRecommendations]);

    const visibleTracks = showAll ? mappedTracks : mappedTracks.slice(0, INITIAL_COUNT);
    const hasMore = mappedTracks.length > INITIAL_COUNT;

    return (
        <section className="mb-5">
            <div className="mb-3">
                <h2 className="section-header__title" style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Рекомендації</h2>
                <p className="track-page__subtitle text-secondary m-0 small">На основі цього треку</p>
            </div>

            {isLoading ? (
                <RecommendationsSkeleton />
            ) : mappedTracks.length === 0 ? (
                <p className="text-secondary small">Немає рекомендацій для цього треку</p>
            ) : (
                <>
                    <div className="d-flex flex-column gap-1">
                        {visibleTracks.map((track) => (
                            <TrackRow
                                key={track.id}
                                track={track}
                                allTracks={mappedTracks}
                                sourceType="Search"
                            />
                        ))}
                    </div>

                    {hasMore && (
                        <button
                            className="btn btn-link text-white-50 text-decoration-none small mt-2 p-0 hover-white"
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
    <div className="d-flex flex-column gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="d-flex align-items-center gap-3 py-2 px-3 bg-white-5 rounded" style={{ height: 56 }}>
                <div className="skeleton" style={{ width: 16, height: 16 }} />
                <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '4px' }} />
                <div className="flex-grow-1">
                    <div className="skeleton mb-1" style={{ width: '30%', height: 14 }} />
                    <div className="skeleton" style={{ width: '15%', height: 12 }} />
                </div>
                <div className="skeleton d-none d-md-block" style={{ width: 100, height: 14 }} />
                <div className="skeleton" style={{ width: 36, height: 14 }} />
            </div>
        ))}
    </div>
);