'use client';

import React, { useRef } from 'react';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { ShowAllButton } from '@/shared/ui/ShowAllButton';
import { TrackCard, type TrackCardData } from '@/entities/track/ui/TrackCard';

interface ArtistRelatedTracksSectionProps {
    artistId: string;
    /** TODO: замінити на хук — useGetApiArtistsIdRelatedTracks(artistId) */
    tracks?: TrackCardData[];
    isLoading?: boolean;
    onTrackClick?: (id: string) => void;
}

const MOCK_TRACKS: TrackCardData[] = [
    { id: '1', title: 'Born Again',    artistNames: ['feat. (G)I-DLE & NYS'],  coverUrl: null },
    { id: '2', title: 'New Woman',     artistNames: ['feat. RIHANNA'],          coverUrl: null },
    { id: '3', title: 'LALISA',        artistNames: ['LISA'],                   coverUrl: null },
    { id: '4', title: 'Moonlit Floor', artistNames: ['LISA'],                   coverUrl: null },
    { id: '5', title: 'Not Shy',       artistNames: ['ITZY'],                   coverUrl: null },
    { id: '6', title: 'Dive',          artistNames: ['IVE'],                    coverUrl: null },
    { id: '7', title: 'Crazy',         artistNames: ['LE SSERAFIM'],            coverUrl: null },
];

/**
 * Секція: "Вас може зацікавити"
 * Треки того ж жанру від інших артистів
 *
 * Підключення даних:
 * 1. const { data, isLoading } = useGetApiArtistsIdRelatedTracks(artistId);
 * 2. <ArtistRelatedTracksSection tracks={data?.items} isLoading={isLoading} />
 */
export const ArtistRelatedTracksSection = ({
                                               artistId,
                                               tracks = MOCK_TRACKS,
                                               isLoading = false,
                                               onTrackClick,
                                           }: ArtistRelatedTracksSectionProps) => {
    const sliderRef = useRef<HTMLDivElement>(null);

    const scroll = (dir: 'prev' | 'next') => {
        if (!sliderRef.current) return;
        const amount = sliderRef.current.offsetWidth * 0.8;
        sliderRef.current.scrollBy({ left: dir === 'next' ? amount : -amount, behavior: 'smooth' });
    };

    return (
        <section className="mb-5">
            <SectionHeader
                title="Вас може зацікавити"
                highlightedWord="зацікавити"
                onPrev={() => scroll('prev')}
                onNext={() => scroll('next')}
            />

            {isLoading ? (
                <div className="row g-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="col-6 col-md-4 col-lg-2">
                            <div className="skeleton skeleton--rounded" style={{ aspectRatio: '1/1' }} />
                            <div className="skeleton mt-2" style={{ height: 13, width: '75%' }} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="section-slider-wrap">
                    <div
                        ref={sliderRef}
                        className="row g-3 flex-nowrap overflow-x-auto artist-slider"
                    >
                        {tracks.map((track) => (
                            <div key={track.id} className="col-6 col-md-4 col-lg-2">
                                <TrackCard track={track} onClick={onTrackClick} />
                            </div>
                        ))}
                        <div className="col-auto" style={{ minWidth: 80 }} />
                    </div>
                </div>
            )}
        </section>
    );
};