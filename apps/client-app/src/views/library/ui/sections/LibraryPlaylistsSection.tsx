'use client';

import React from 'react';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { PlaylistCard, type PlaylistCardData } from '@/entities/playlist/ui/PlaylistCard';
import { ShowAllButton } from '@/shared/ui/ShowAllButton';
import { useHasOverflow } from '@/shared/lib/useHasOverflow';

interface LibraryPlaylistsSectionProps {
    playlists?: PlaylistCardData[];
    isLoading?: boolean;
    showAllHref?: string;
    onPlaylistClick?: (id: string) => void;
}

export const LibraryPlaylistsSection = ({
                                            playlists = [],
                                            isLoading = false,
                                            showAllHref = '/playlists',
                                            onPlaylistClick,
                                        }: LibraryPlaylistsSectionProps) => {
    const [sliderRef, hasOverflow] = useHasOverflow<HTMLDivElement>([playlists]);

    const scroll = (dir: 'prev' | 'next') => {
        if (!sliderRef.current) return;
        const amount = sliderRef.current.offsetWidth * 0.8;
        sliderRef.current.scrollBy({
            left: dir === 'next' ? amount : -amount,
            behavior: 'smooth',
        });
    };

    if (!isLoading && playlists.length === 0) return null;

    return (
        <section className="mb-5">
            <SectionHeader
                title="Плейлісти"
                showAll
                showAllHref={showAllHref}
                onPrev={hasOverflow ? () => scroll('prev') : undefined}
                onNext={hasOverflow ? () => scroll('next') : undefined}
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
                        <ShowAllButton href={showAllHref} />
                    </div>
                </div>
            )}
        </section>
    );
};