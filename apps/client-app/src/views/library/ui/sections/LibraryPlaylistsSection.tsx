'use client';

import React, { useRef } from 'react';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { PlaylistCard, type PlaylistCardData } from '@/entities/playlist/ui/PlaylistCard';
import {ShowAllButton} from "@/shared/ui/ShowAllButton";

interface LibraryPlaylistsSectionProps {
    /** TODO: замінити на хук — useGetApiUserPlaylists() */
    playlists?: PlaylistCardData[];
    isLoading?: boolean;
    showAllHref?: string;
    onPlaylistClick?: (id: string) => void;
}

const MOCK_PLAYLISTS: PlaylistCardData[] = [
    { id: '1', name: 'On The Floor',  authorName: 'JLO',           tracksCount: 19, coverUrl: null },
    { id: '2', name: 'Reputation',    authorName: 'Taylor Swift',   tracksCount: 10, coverUrl: null },
    { id: '3', name: 'Yours Truly',   authorName: 'Ariana Grande',  tracksCount: 5,  coverUrl: null },
    { id: '4', name: 'Маргарита',     authorName: 'Michelle',       tracksCount: 7,  coverUrl: null },
    { id: '5', name: '30 Vinyl',      authorName: 'Adele',          tracksCount: 12, coverUrl: null },
    { id: '6', name: 'When You Knock',authorName: 'Various',        tracksCount: 8,  coverUrl: null },
    { id: '7', name: 'Songs Of The...',authorName: 'Various',       tracksCount: 14, coverUrl: null },
];

/**
 * Секція: Плейлісти (сторінка медіатеки)
 *
 * Підключення даних:
 * 1. const { data, isLoading } = useGetApiUserPlaylists();
 * 2. <LibraryPlaylistsSection playlists={data?.items} isLoading={isLoading} />
 */
export const LibraryPlaylistsSection = ({
                                            playlists = MOCK_PLAYLISTS,
                                            isLoading = false,
                                            showAllHref = '/playlists',
                                            onPlaylistClick,
                                        }: LibraryPlaylistsSectionProps) => {
    const sliderRef = useRef<HTMLDivElement>(null);

    const scroll = (dir: 'prev' | 'next') => {
        if (!sliderRef.current) return;
        const amount = sliderRef.current.offsetWidth * 0.8;
        sliderRef.current.scrollBy({ left: dir === 'next' ? amount : -amount, behavior: 'smooth' });
    };

    return (
        <section className="mb-5">
            <SectionHeader
                title="Плейлісти"
                showAll
                showAllHref={showAllHref}
                onPrev={() => scroll('prev')}
                onNext={() => scroll('next')}
            />

            {isLoading ? (
                <div className="row g-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="col-6 col-md-4 col-lg-2">
                            <div className="skeleton skeleton--rounded" style={{ aspectRatio: '1/1' }} />
                            <div className="skeleton mt-2" style={{ height: 13, width: '75%' }} />
                            <div className="skeleton mt-1" style={{ height: 11, width: '55%' }} />
                        </div>
                    ))}
                </div>
            ) : (
                <div
                    ref={sliderRef}
                    className="row g-3 flex-nowrap overflow-x-auto library-slider"
                >
                    {playlists.map((playlist) => (
                        <div key={playlist.id} className="col-6 col-md-4 col-lg-2">
                            <PlaylistCard
                                playlist={playlist}
                                onClick={onPlaylistClick}
                            />
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