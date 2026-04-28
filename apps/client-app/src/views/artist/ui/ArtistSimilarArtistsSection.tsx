'use client';

import React, { useRef } from 'react';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { ShowAllButton } from '@/shared/ui/ShowAllButton';
import { ArtistCard, type ArtistCardData } from '@/entities/artist/ui/ArtistCard';

interface ArtistSimilarArtistsSectionProps {
    artistId: string;
    /** TODO: замінити на хук — useGetApiArtistsIdSimilarArtists(artistId) */
    artists?: ArtistCardData[];
    isLoading?: boolean;
    onArtistClick?: (id: string) => void;
}

const MOCK_ARTISTS: ArtistCardData[] = [
    { id: '1', name: 'LE SSERAFIM', monthlyListeners: 234326, avatarUrl: null },
    { id: '2', name: 'aespa',       monthlyListeners: 440243, avatarUrl: null },
    { id: '3', name: 'Hwa Sa',      monthlyListeners: 294526, avatarUrl: null },
    { id: '4', name: 'JENNIE',      monthlyListeners: 448563, avatarUrl: null },
    { id: '5', name: 'ROSÉ',        monthlyListeners: 388206, avatarUrl: null },
];

/**
 * Секція: "Шанувальникам також подобаються"
 * Артисти схожого жанру
 *
 * Підключення даних:
 * 1. const { data, isLoading } = useGetApiArtistsIdSimilarArtists(artistId);
 * 2. <ArtistSimilarArtistsSection artists={data?.items} isLoading={isLoading} />
 */
export const ArtistSimilarArtistsSection = ({
                                                artistId,
                                                artists = MOCK_ARTISTS,
                                                isLoading = false,
                                                onArtistClick,
                                            }: ArtistSimilarArtistsSectionProps) => {
    const sliderRef = useRef<HTMLDivElement>(null);

    const scroll = (dir: 'prev' | 'next') => {
        if (!sliderRef.current) return;
        const amount = sliderRef.current.offsetWidth * 0.8;
        sliderRef.current.scrollBy({ left: dir === 'next' ? amount : -amount, behavior: 'smooth' });
    };

    return (
        <section className="mb-5">
            <SectionHeader
                title="Шанувальникам також подобаються"
                highlightedWord="подобаються"
                onPrev={() => scroll('prev')}
                onNext={() => scroll('next')}
            />

            {isLoading ? (
                <div className="d-flex gap-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="d-flex flex-column align-items-center gap-2">
                            <div className="skeleton skeleton--circle" style={{ width: 120, height: 120 }} />
                            <div className="skeleton" style={{ height: 12, width: 80 }} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="section-slider-wrap">
                    <div
                        ref={sliderRef}
                        className="row g-4 flex-nowrap overflow-x-auto artist-slider"
                    >
                        {artists.map((artist) => (
                            <div key={artist.id} className="col-auto">
                                <ArtistCard artist={artist} onClick={onArtistClick} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
};