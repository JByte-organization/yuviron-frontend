'use client';

import React, { useRef } from 'react';
import { ShowAllButton } from '@/shared/ui/ShowAllButton';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { TrackCard, type TrackCardData } from '@/entities/track/ui/TrackCard';

interface TopTracksSectionProps {
    /** TODO: замінити на хук — useGetApiHomeTopTracks() */
    sectionTitle?: string;
    tracks?: TrackCardData[];
    isLoading?: boolean;
    showAllHref?: string;
    onTrackClick?: (id: string) => void;
}

const MOCK_TRACKS: TrackCardData[] = [
    { id: '1', title: 'Die with a smile',  artistNames: ['Lady Gaga', 'Bruno Mars'],    coverUrl: null },
    { id: '2', title: 'Глубоко',           artistNames: ['Monatik', 'Надя Дорофєєва'],  coverUrl: null },
    { id: '3', title: 'Superman',          artistNames: ['Eminem'],                      coverUrl: null },
    { id: '4', title: 'Sweater Weather',   artistNames: ['The Neighbourhood'],           coverUrl: null },
    { id: '5', title: 'Cry Me A River',    artistNames: ['Justin Timberlake'],           coverUrl: null },
    { id: '6', title: 'Superman',          artistNames: ['Eminem'],                      coverUrl: null },
];

/**
 * Секція: "Топ ВАША музика сьогодні!"
 *
 * Підключення даних:
 * 1. const { data, isLoading } = useGetApiHomeTopTracks();
 * 2. <TopTracksSection tracks={data?.items} isLoading={isLoading} />
 */
export const TopTracksSection = ({
                                     sectionTitle,
                                     tracks = MOCK_TRACKS,
                                     isLoading = false,
                                     showAllHref = '/tracks',
                                     onTrackClick,
                                 }: TopTracksSectionProps) => {
    const sliderRef = useRef<HTMLDivElement>(null);

    const scroll = (dir: 'prev' | 'next') => {
        if (!sliderRef.current) return;
        const amount = sliderRef.current.offsetWidth * 0.8;
        sliderRef.current.scrollBy({ left: dir === 'next' ? amount : -amount, behavior: 'smooth' });
    };

    return (
        <section className="mb-4">
            <SectionHeader
                title={sectionTitle ?? "Топ ВАША музика сьогодні!"}
                highlightedWord="музика"
                onPrev={() => scroll('prev')}
                onNext={() => scroll('next')}
            />

            {isLoading ? (
                <div className="row g-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="col-6 col-md-4 col-lg-2">
                            <TrackCardSkeleton />
                        </div>
                    ))}
                </div>
            ) : (
                <div
                    ref={sliderRef}
                    className="row g-3 flex-nowrap overflow-x-auto top-tracks-slider"
                >
                    {tracks.map((track) => (
                        <div
                            key={track.id}
                            className="col-6 col-md-4 col-lg-2"
                        >
                            <TrackCard track={track} onClick={onTrackClick}/>
                        </div>
                    ))}

                    <div className="col-auto d-flex align-items-center">
                        <ShowAllButton href="/tracks"/>
                    </div>
                </div>
            )}
        </section>
    );
};

const TrackCardSkeleton = () => (
    <div>
    <div className="skeleton skeleton--rounded mb-2" style={{aspectRatio: '1/1'}}/>
        <div className="skeleton mb-1" style={{height: 13, width: '75%'}}/>
        <div className="skeleton" style={{ height: 11, width: '55%' }} />
    </div>
);