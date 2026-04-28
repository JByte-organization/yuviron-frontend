'use client';

import React, { useState, useRef } from 'react';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { ShowAllButton } from '@/shared/ui/ShowAllButton';
import { AlbumCard, type AlbumCardData } from '@/entities/album/ui/AlbumCard';

type MusicTab = 'popular' | 'albums' | 'singles';

interface ArtistMusicSectionProps {
    artistId: string;
    artistName: string;
    /** TODO: замінити на хук — useGetApiArtistsIdPopularReleases(artistId) */
    popularReleases?: AlbumCardData[];
    /** TODO: замінити на хук — useGetApiArtistsIdAlbums(artistId) */
    albums?: AlbumCardData[];
    /** TODO: замінити на хук — useGetApiArtistsIdSingles(artistId) */
    singles?: AlbumCardData[];
    isLoading?: boolean;
    onAlbumClick?: (id: string) => void;
}

const MOCK_RELEASES: AlbumCardData[] = [
    { id: '1', title: 'Pink Venom',      artistName: 'BLACKPINK', tracksCount: 1,  coverUrl: null },
    { id: '2', title: 'Born Pink',       artistName: 'BLACKPINK', tracksCount: 8,  coverUrl: null },
    { id: '3', title: 'Kill This Love',  artistName: 'BLACKPINK', tracksCount: 5,  coverUrl: null },
    { id: '4', title: 'The Girls',       artistName: 'BLACKPINK', tracksCount: 3,  coverUrl: null },
    { id: '5', title: 'Playing With Fire', artistName: 'BLACKPINK', tracksCount: 4, coverUrl: null },
    { id: '6', title: 'See U Later',     artistName: 'BLACKPINK', tracksCount: 2,  coverUrl: null },
    { id: '7', title: 'Kick It',         artistName: 'BLACKPINK', tracksCount: 1,  coverUrl: null },
];

const TABS: { key: MusicTab; label: string }[] = [
    { key: 'popular', label: 'Популярні релізи' },
    { key: 'albums',  label: 'Альбоми' },
    { key: 'singles', label: 'Сингли та EP' },
];

/**
 * Секція: Музика артиста з табами
 *
 * Підключення даних — залежить від активного табу:
 * popular: useGetApiArtistsIdPopularReleases(artistId)
 * albums:  useGetApiArtistsIdAlbums(artistId)
 * singles: useGetApiArtistsIdSingles(artistId)
 */
export const ArtistMusicSection = ({
                                       artistId,
                                       artistName,
                                       popularReleases = MOCK_RELEASES,
                                       albums = MOCK_RELEASES,
                                       singles = MOCK_RELEASES.slice(0, 3),
                                       isLoading = false,
                                       onAlbumClick,
                                   }: ArtistMusicSectionProps) => {
    const [activeTab, setActiveTab] = useState<MusicTab>('popular');
    const sliderRef = useRef<HTMLDivElement>(null);

    const scroll = (dir: 'prev' | 'next') => {
        if (!sliderRef.current) return;
        const amount = sliderRef.current.offsetWidth * 0.8;
        sliderRef.current.scrollBy({ left: dir === 'next' ? amount : -amount, behavior: 'smooth' });
    };

    const dataMap: Record<MusicTab, AlbumCardData[]> = {
        popular: popularReleases,
        albums,
        singles,
    };

    const currentData = dataMap[activeTab];
    const showAllHref = `/artists/${artistId}/${activeTab}`;

    return (
        <section className="mb-5">
            <SectionHeader
                title="Музика"
                onPrev={() => scroll('prev')}
                onNext={() => scroll('next')}
            />

            {/* ─── Таби ─────────────────────────────────── */}
            <div className="artist-music-tabs mb-3">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        className={`artist-music-tabs__btn${activeTab === tab.key ? ' artist-music-tabs__btn--active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ─── Слайдер ──────────────────────────────── */}
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
                        {currentData.map((album) => (
                            <div key={album.id} className="col-6 col-md-4 col-lg-2">
                                <AlbumCard album={album} onClick={onAlbumClick} />
                            </div>
                        ))}
                        <div className="col-auto" style={{ minWidth: 80 }} />
                    </div>
                </div>
            )}
        </section>
    );
};