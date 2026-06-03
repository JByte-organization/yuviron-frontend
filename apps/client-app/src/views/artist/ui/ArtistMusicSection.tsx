'use client';

import React, { useState, useRef, useMemo } from 'react';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { AlbumCard, type AlbumCardData } from '@/entities/album/ui/AlbumCard';
import { getImageUrl } from '@/shared/lib/getImageUrl';
import type { ArtistAlbumDto } from '@repo/api/client.ts';

type MusicTab = 'popular' | 'albums' | 'singles';

interface ArtistMusicSectionProps {
    artistId: string;
    artistName: string;
    popularReleases?: ArtistAlbumDto[];
    albums?: ArtistAlbumDto[];
    singles?: ArtistAlbumDto[];
    isLoading?: boolean;
    onAlbumClick?: (id: string) => void;
}

const TABS: { key: MusicTab; label: string }[] = [
    { key: 'popular', label: 'Популярні релізи' },
    { key: 'albums',  label: 'Альбоми' },
    { key: 'singles', label: 'Сингли та EP' },
];

export const ArtistMusicSection = ({
                                       artistId,
                                       artistName,
                                       popularReleases = [],
                                       albums = [],
                                       singles = [],
                                       isLoading = false,
                                       onAlbumClick,
                                   }: ArtistMusicSectionProps) => {
    const [activeTab, setActiveTab] = useState<MusicTab>('popular');
    const sliderRef = useRef<HTMLDivElement>(null);

    // Хелпер для мапінгу ArtistAlbumDto у формат картки AlbumCardData
    const mapToCardData = (list: ArtistAlbumDto[]): AlbumCardData[] => {
        return list.map((a) => ({
            id:          a.id ?? '',
            title:       a.title ?? 'Без назви',
            artistName:  artistName, // Підставляємо ім'я поточного артиста
            coverUrl:    getImageUrl(a.coverUrl),
            // Оскільки в ArtistAlbumDto немає tracksCount, AlbumCard виведе гарний підпис "by Artist"
            tracksCount: undefined,
        }));
    };

    // ─── Мапінг даних через useMemo ──────────────────────────────────────────
    const dataMap = useMemo<Record<MusicTab, AlbumCardData[]>>(() => {
        return {
            popular: mapToCardData(popularReleases),
            albums:  mapToCardData(albums),
            singles: mapToCardData(singles),
        };
    }, [popularReleases, albums, singles, artistName]);

    const currentData = dataMap[activeTab];

    const hasData = currentData.length > 0;

    const scroll = (dir: 'prev' | 'next') => {
        if (!sliderRef.current) return;
        const amount = sliderRef.current.offsetWidth * 0.8;
        sliderRef.current.scrollBy({ left: dir === 'next' ? amount : -amount, behavior: 'smooth' });
    };

    return (
        <section className="artist-music mb-5">
            <SectionHeader
                title="Музика"
                onPrev={hasData ? () => scroll('prev') : undefined}
                onNext={hasData ? () => scroll('next') : undefined}
            />

            {/* ─── Таби ─────────────────────────────────── */}
            <div className="artist-music-tabs mb-3 d-flex gap-2">
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

            {/* ─── Слайдер / Скелетон ────────────────────── */}
            {isLoading ? (
                <div className="section-slider-wrap">
                    <div className="row g-3 flex-nowrap overflow-hidden">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="col-6 col-md-4 col-lg-2" style={{ flex: '0 0 auto' }}>
                                <div className="skeleton skeleton--rounded" style={{ aspectRatio: '1/1' }} />
                                <div className="skeleton mt-2" style={{ height: 13, width: '75%' }} />
                                <div className="skeleton mt-1" style={{ height: 11, width: '40%' }} />
                            </div>
                        ))}
                    </div>
                </div>
            ) : !hasData ? (
                <p className="text-secondary small py-3 m-0">У цього виконавця ще немає релізів у цій категорії</p>
            ) : (
                <div className="section-slider-wrap">
                    <div
                        ref={sliderRef}
                        className="row g-3 flex-nowrap overflow-x-auto artist-slider"
                    >
                        {currentData.map((album) => (
                            <div key={album.id} className="col-6 col-md-4 col-lg-2" style={{ flex: '0 0 auto' }}>
                                <AlbumCard album={album} onClick={onAlbumClick} />
                            </div>
                        ))}
                        <div className="col-auto" style={{ minWidth: 40 }} />
                    </div>
                </div>
            )}
        </section>
    );
};