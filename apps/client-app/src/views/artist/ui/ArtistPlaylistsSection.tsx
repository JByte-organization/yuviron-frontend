'use client';

import React, { useMemo, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import type { Swiper as SwiperClass } from 'swiper';

import { SectionHeader } from '@/shared/ui/SectionHeader';
import { PlaylistCard } from '@/entities/playlist/ui/PlaylistCard';
import { getImageUrl } from '@/shared/lib/getImageUrl';
import type { ArtistPlaylistDto } from '@repo/api/client.ts';

interface ArtistPlaylistsSectionProps {
    artistName: string;
    playlists?: ArtistPlaylistDto[];
    isLoading?: boolean;
    onPlaylistClick?: (id: string) => void;
}

export const ArtistPlaylistsSection = ({
                                           artistName,
                                           playlists = [],
                                           isLoading = false,
                                           onPlaylistClick,
                                       }: ArtistPlaylistsSectionProps) => {
    // Екземпляр Swiper для керування зовнішніми стрілками
    const [swiperInstance, setSwiperInstance] = useState<SwiperClass | null>(null);

    // ─── Маппинг даних з DTO у формат картки ────────────────
    const mappedPlaylists = useMemo(() => {
        if (!playlists || playlists.length === 0) return [];

        return playlists.map((p) => ({
            id:          p.id ?? '',
            name:        p.title ?? 'Без назви',
            authorName:  p.creatorName ?? 'Невідомий автор',
            tracksCount: p.tracksCount ?? 0,
            coverUrl:    getImageUrl(p.coverUrl),
        }));
    }, [playlists]);

    if (!isLoading && mappedPlaylists.length === 0) return null;

    return (
        <section className="artist-playlists mb-5">
            <SectionHeader
                title={`${artistName}: плейлісти виконавця`}
                highlightedWord="плейлісти"
                onPrev={swiperInstance ? () => swiperInstance.slidePrev() : undefined}
                onNext={swiperInstance ? () => swiperInstance.slideNext() : undefined}
            />

            {isLoading ? (
                // Скелетони: чітко підігнані під сітку з 7 елементів
                <div className="section-slider-wrap">
                    <div className="d-flex gap-4 overflow-hidden">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <div
                                key={i}
                                className="d-flex flex-column align-items-stretch gap-2"
                                style={{ flex: '0 0 calc((100% - 6 * 24px) / 7)', minWidth: '140px' }}
                            >
                                <div className="skeleton skeleton--rounded" style={{ aspectRatio: '1/1' }} />
                                <div className="skeleton mt-2" style={{ height: 13, width: '75%' }} />
                                <div className="skeleton mt-1" style={{ height: 11, width: '40%' }} />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="section-slider-wrap">
                    {/* Сучасна карусель на Swiper з брейкпоїнтом на 7 слайдів */}
                    <Swiper
                        modules={[FreeMode]}
                        freeMode
                        slidesPerView={2}
                        spaceBetween={24}
                        breakpoints={{
                            480:  { slidesPerView: 3 },
                            768:  { slidesPerView: 4 },
                            992:  { slidesPerView: 5 },
                            1200: { slidesPerView: 7 }, // Ідеальні 7 штук в ряд на десктопі
                        }}
                        onSwiper={setSwiperInstance}
                        className="artist-playlists__swiper"
                    >
                        {mappedPlaylists.map((playlist) => (
                            <SwiperSlide key={playlist.id} style={{ width: 'auto' }}>
                                <PlaylistCard playlist={playlist} onClick={onPlaylistClick} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            )}
        </section>
    );
};