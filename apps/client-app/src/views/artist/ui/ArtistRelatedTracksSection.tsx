'use client';

import React, { useMemo } from 'react';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { TrackCard, type TrackCardData } from '@/entities/track/ui/TrackCard';
import { getImageUrl } from '@/shared/lib/getImageUrl';
import { useHasOverflow } from '@/shared/lib/useHasOverflow';
import type { RelatedTrackDto } from '@repo/api/client.ts';

interface ArtistRelatedTracksSectionProps {
    tracks?: RelatedTrackDto[];
    isLoading?: boolean;
    onTrackClick?: (mappedTracks: TrackCardData[], index: number) => void;
}

export const ArtistRelatedTracksSection = ({
                                               tracks = [],
                                               isLoading = false,
                                               onTrackClick,
                                           }: ArtistRelatedTracksSectionProps) => {
    const [sliderRef, hasOverflow] = useHasOverflow<HTMLDivElement>([tracks]);

    const mappedTracks: TrackCardData[] = useMemo(() => {
        if (!tracks || tracks.length === 0) return [];

        return tracks.map((t) => ({
            id:          t.id ?? '',
            title:       t.title ?? 'Без назви',
            artistNames: (t.artists ?? []).map(a => a.name ?? '').filter(Boolean),
            coverUrl:    getImageUrl(t.coverUrl),
            durationMs:  t.durationMs,
        }));
    }, [tracks]);

    if (!isLoading && mappedTracks.length === 0) return null;

    const scroll = (dir: 'prev' | 'next') => {
        if (!sliderRef.current) return;
        const amount = sliderRef.current.offsetWidth * 0.8;
        sliderRef.current.scrollBy({ left: dir === 'next' ? amount : -amount, behavior: 'smooth' });
    };

    return (
        <section className="artist-related-tracks mb-5">
            <SectionHeader
                title="Вас може зацікавити"
                highlightedWord="зацікавити"
                onPrev={hasOverflow ? () => scroll('prev') : undefined}
                onNext={hasOverflow ? () => scroll('next') : undefined}
            />

            {isLoading ? (
                <div className="section-slider-wrap">
                    <div className="row g-3 flex-nowrap overflow-hidden">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="col-6 col-md-4 col-lg-2" style={{ flex: '0 0 auto' }}>
                                <div className="skeleton skeleton--rounded" style={{ aspectRatio: '1/1' }} />
                                <div className="skeleton mt-2" style={{ height: 13, width: '75%' }} />
                                <div className="skeleton mt-1" style={{ height: 11, width: '50%' }} />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="section-slider-wrap">
                    <div
                        ref={sliderRef}
                        className="row g-3 flex-nowrap overflow-x-auto artist-slider"
                    >
                        {mappedTracks.map((track, index) => (
                            <div key={track.id} className="col-6 col-md-4 col-lg-2" style={{ flex: '0 0 auto' }}>
                                <TrackCard
                                    track={track}
                                    onClick={() => onTrackClick?.(mappedTracks, index)}
                                />
                            </div>
                        ))}
                        <div className="col-auto" style={{ minWidth: 40 }} />
                    </div>
                </div>
            )}
        </section>
    );
};