'use client';

import React, { useMemo, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import type { Swiper as SwiperClass } from 'swiper';

import { SectionHeader } from '@/shared/ui/SectionHeader';
import { ArtistCard, type ArtistCardData } from '@/entities/artist/ui/ArtistCard';
import { getImageUrl } from '@/shared/lib/getImageUrl';
import type { SimilarArtistDto } from '@repo/api/client';


interface ArtistSimilarArtistsSectionProps {
    artists?: SimilarArtistDto[];
    isLoading?: boolean;
    onArtistClick?: (id: string) => void;
}

export const ArtistSimilarArtistsSection = ({
                                                artists = [],
                                                isLoading = false,
                                                onArtistClick,
                                            }: ArtistSimilarArtistsSectionProps) => {
    const [swiperInstance, setSwiperInstance] = useState<SwiperClass | null>(null);

    const mappedArtists = useMemo<ArtistCardData[]>(() => {
        if (!artists || artists.length === 0) return [];

        return artists.map((a) => ({
            id:               a.id ?? '',
            name:             a.name ?? 'Невідомий виконавець',
            monthlyListeners: a.followersCount ?? 0,
            avatarUrl:        getImageUrl(a.avatarUrl),
        }));
    }, [artists]);

    if (!isLoading && mappedArtists.length === 0) return null;

    return (
        <section className="artist-similar mb-5">
            <SectionHeader
                title="Шанувальникам також подобаються"
                highlightedWord="подобаються"
                onPrev={swiperInstance ? () => swiperInstance.slidePrev() : undefined}
                onNext={swiperInstance ? () => swiperInstance.slideNext() : undefined}
            />

            {isLoading ? (
                <div className="section-slider-wrap">
                    <div className="d-flex gap-4 overflow-hidden">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <div
                                key={i}
                                className="d-flex flex-column align-items-center gap-2"
                                style={{ flex: '0 0 calc((100% - 6 * 24px) / 7)', minWidth: '140px' }}
                            >
                                <div className="skeleton skeleton--circle" style={{ width: 120, height: 120 }} />
                                <div className="skeleton mt-1" style={{ height: 13, width: '80%' }} />
                                <div className="skeleton" style={{ height: 11, width: '50%' }} />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="section-slider-wrap">
                    <Swiper
                        modules={[FreeMode]}
                        freeMode
                        slidesPerView={2}
                        spaceBetween={24}
                        breakpoints={{
                            480:  { slidesPerView: 3 },
                            768:  { slidesPerView: 3 },
                            992:  { slidesPerView: 3 },
                            1200: { slidesPerView: 7 },
                        }}
                        onSwiper={setSwiperInstance}
                        className="artist-similar__swiper"
                    >
                        {mappedArtists.map((artist) => (
                            <SwiperSlide key={artist.id} style={{ width: 'auto' }}>
                                <ArtistCard artist={artist} onClick={onArtistClick} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            )}
        </section>
    );
};