'use client';

import React from 'react';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { ArtistCard, type ArtistCardData } from '@/entities/artist/ui/ArtistCard';

interface FavoriteArtistsSectionProps {
    /** TODO: заменить на хук — useGetApiHomeFavoriteArtists() */
    artists?: ArtistCardData[];
    isLoading?: boolean;
    showAllHref?: string;
    onArtistClick?: (id: string) => void;
}

const MOCK_ARTISTS: ArtistCardData[] = [
    { id: '1', name: 'Lana Del Rey',   monthlyListeners: 4690563, avatarUrl: null },
    { id: '2', name: 'Lady Gaga',      monthlyListeners: 4690563, avatarUrl: null },
    { id: '3', name: 'Shakira',        monthlyListeners: 4690563, avatarUrl: null },
    { id: '4', name: 'Jennifer Lopez', monthlyListeners: 4690563, avatarUrl: null },
];

/**
 * Секція: "Твої улюблені виконавці"
 *
 * Підключення даних:
 * 1. const { data, isLoading } = useGetApiHomeFavoriteArtists();
 * 2. <FavoriteArtistsSection artists={data?.items} isLoading={isLoading} />
 */
export const FavoriteArtistsSection = ({
                                           artists = MOCK_ARTISTS,
                                           isLoading = false,
                                           showAllHref = '/artists',
                                           onArtistClick,
                                       }: FavoriteArtistsSectionProps) => {
    return (
        <section className="mb-4">
            <SectionHeader
                title="Твої улюблені виконавці"
                highlightedWord="виконавці"
                showAll
                showAllHref={showAllHref}
            />

            {isLoading ? (
                <ArtistsSkeleton />
            ) : (
                <div className="h-scroll">
                    {artists.map((artist) => (
                        <ArtistCard
                            key={artist.id}
                            artist={artist}
                            onClick={onArtistClick}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

const ArtistsSkeleton = () => (
    <div className="d-flex gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="d-flex flex-column align-items-center gap-2">
                <div className="skeleton skeleton--circle" style={{ width: 120, height: 120 }} />
                <div className="skeleton" style={{ height: 12, width: 80 }} />
                <div className="skeleton" style={{ height: 10, width: 60 }} />
            </div>
        ))}
    </div>
);