'use client';

import React, { useRef } from 'react';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { ShowAllButton } from '@/shared/ui/ShowAllButton';
import { PlaylistCard, type PlaylistCardData } from '@/entities/playlist/ui/PlaylistCard';

interface ArtistPlaylistsSectionProps {
    artistId: string;
    artistName: string;
    /** TODO: замінити на хук — useGetApiArtistsIdPlaylists(artistId) */
    playlists?: PlaylistCardData[];
    isLoading?: boolean;
    onPlaylistClick?: (id: string) => void;
}

const MOCK_PLAYLISTS: PlaylistCardData[] = [
    { id: '1', name: "Lisa's Playlist",   authorName: 'YG Entertainment', tracksCount: 15, coverUrl: null },
    { id: '2', name: "Jisoo's Playlist",  authorName: 'YG Entertainment', tracksCount: 12, coverUrl: null },
    { id: '3', name: "Rose's Playlist",   authorName: 'YG Entertainment', tracksCount: 10, coverUrl: null },
    { id: '4', name: "Jennie's Playlist", authorName: 'YG Entertainment', tracksCount: 18, coverUrl: null },
];

/**
 * Секція: Плейлісти виконавця
 *
 * Підключення даних:
 * 1. const { data, isLoading } = useGetApiArtistsIdPlaylists(artistId);
 * 2. <ArtistPlaylistsSection playlists={data?.items} isLoading={isLoading} />
 */
export const ArtistPlaylistsSection = ({
                                           artistId,
                                           artistName,
                                           playlists = MOCK_PLAYLISTS,
                                           isLoading = false,
                                           onPlaylistClick,
                                       }: ArtistPlaylistsSectionProps) => {
    const sliderRef = useRef<HTMLDivElement>(null);

    const scroll = (dir: 'prev' | 'next') => {
        if (!sliderRef.current) return;
        const amount = sliderRef.current.offsetWidth * 0.8;
        sliderRef.current.scrollBy({ left: dir === 'next' ? amount : -amount, behavior: 'smooth' });
    };

    return (
        <section className="mb-5">
            <SectionHeader
                title={`${artistName}: плейлісти виконавця`}
                highlightedWord="плейлісти"
                onPrev={() => scroll('prev')}
                onNext={() => scroll('next')}
            />

            {isLoading ? (
                <div className="row g-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="col-6 col-md-3">
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
                        {playlists.map((playlist) => (
                            <div key={playlist.id} className="col-6 col-md-4 col-lg-2">
                                <PlaylistCard playlist={playlist} onClick={onPlaylistClick} />
                            </div>
                        ))}
                        <div className="col-auto" style={{ minWidth: 80 }} />
                    </div>
                </div>
            )}
        </section>
    );
};