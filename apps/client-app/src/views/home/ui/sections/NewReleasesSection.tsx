'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { AlbumCard, type AlbumCardData } from '@/entities/album/ui/AlbumCard';

interface NewReleasesSectionProps {
    /** TODO: замінити на хук — useGetApiHomeNewReleases() */
    albums?: AlbumCardData[];
    isLoading?: boolean;
    showAllHref?: string;
    onAlbumClick?: (id: string) => void;
}

const MOCK_ALBUMS: AlbumCardData[] = [
    { id: '1', title: 'On The Floor',  artistName: 'JLO',          tracksCount: 19, coverUrl: null },
    { id: '2', title: 'Reputation',    artistName: 'Taylor Swift',  tracksCount: 10, coverUrl: null },
    { id: '3', title: 'Yours Truly',   artistName: 'Ariana Grande', tracksCount: 5,  coverUrl: null },
    { id: '4', title: 'Маргарита',     artistName: 'Michelle Andrade', tracksCount: 7, coverUrl: null },
    { id: '5', title: '30 Vinyl',      artistName: 'Adele',         tracksCount: 7,  coverUrl: null },
    { id: '6', title: 'Reputation',    artistName: 'Taylor Swift',  tracksCount: 10, coverUrl: null },
];

/**
 * Секція: "Нові музичні релізи"
 *
 * Підключення даних:
 * 1. const { data, isLoading } = useGetApiHomeNewReleases();
 * 2. <NewReleasesSection albums={data?.items} isLoading={isLoading} />
 */
export const NewReleasesSection = ({
                                       albums = MOCK_ALBUMS,
                                       isLoading = false,
                                       showAllHref = '/albums',
                                       onAlbumClick,
                                   }: NewReleasesSectionProps) => {
    const sliderRef = useRef<HTMLDivElement>(null);

    const scroll = (dir: 'prev' | 'next') => {
        if (!sliderRef.current) return;
        const amount = sliderRef.current.offsetWidth * 0.8;
        sliderRef.current.scrollBy({ left: dir === 'next' ? amount : -amount, behavior: 'smooth' });
    };

    return (
        <section className="mb-4">
            <SectionHeader
                title="Нові музичні релізи"
                highlightedWord="музичні"
                onPrev={() => scroll('prev')}
                onNext={() => scroll('next')}
            />

            {isLoading ? (
                <div className="row g-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="col-6 col-md-4 col-lg-2">
                            <AlbumCardSkeleton />
                        </div>
                    ))}
                </div>
            ) : (
                <div
                    ref={sliderRef}
                    className="row g-3 flex-nowrap overflow-x-auto new-releases-slider"
                >
                    {albums.map((album) => (
                        <div
                            key={album.id}
                            className="col-6 col-md-4 col-lg-2"
                        >
                            <AlbumCard album={album} onClick={onAlbumClick} />
                        </div>
                    ))}

                    {/* Кнопка "Все тут" */}
                    <div className="col-auto d-flex align-items-center">
                        <Link href={showAllHref} className="show-all-btn">
                            <i className="bi bi-plus" />
                            <span>Все тут</span>
                        </Link>
                    </div>
                </div>
            )}
        </section>
    );
};

const AlbumCardSkeleton = () => (
    <div>
        <div className="skeleton skeleton--rounded mb-2" style={{ aspectRatio: '1/1', width: '100%' }} />
        <div className="skeleton mb-1" style={{ height: 13, width: '75%' }} />
        <div className="skeleton mb-1" style={{ height: 11, width: '55%' }} />
        <div className="skeleton" style={{ height: 10, width: '40%' }} />
    </div>
);