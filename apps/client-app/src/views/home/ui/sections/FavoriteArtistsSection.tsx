'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { ArtistCard, type ArtistCardData } from '@/entities/artist/ui/ArtistCard';

import 'swiper/css';
import 'swiper/css/free-mode';

// ─── Типи ─────────────────────────────────────────────────────────────────────
interface FavoriteArtistsSectionProps {
    sectionTitle?: string;
    artists?: ArtistCardData[];
    isLoading?: boolean;
    showAllHref?: string;
    onArtistClick?: (id: string) => void;
}

// ─── Компонент ────────────────────────────────────────────────────────────────
// Секція відповідає тільки за відображення.
// Дані (artists, isLoading) приходять з батьківського компонента.
export const FavoriteArtistsSection = ({
                                           sectionTitle = 'Популярні виконавці',
                                           artists,
                                           isLoading = false,
                                           showAllHref = '/artists',
                                           onArtistClick,
                                       }: FavoriteArtistsSectionProps) => {

    if (!isLoading && (!artists || artists.length === 0)) return null;

    const lastWord = sectionTitle.trim().split(' ').at(-1) ?? '';

    return (
        <section className="favorite-artists-section mb-4 mb-md-5">
            <SectionHeader
                title={sectionTitle}
                highlightedWord={lastWord}
                showAll
                showAllHref={showAllHref}
            />

            {isLoading ? (
                <ArtistsSkeleton />
            ) : (
                <Swiper
                    modules={[FreeMode]}
                    freeMode
                    slidesPerView={2}
                    spaceBetween={24}
                    breakpoints={{
                        480:  { slidesPerView: 3 },
                        768:  { slidesPerView: 3 },
                        992:  { slidesPerView: 5 },
                        1200: { slidesPerView: 7 },
                    }}
                    className="favorite-artists-section__swiper"
                >
                    {artists!.map((artist) => (
                        <SwiperSlide key={artist.id}>
                            <ArtistCard
                                artist={artist}
                                onClick={onArtistClick}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
            )}
        </section>
    );
};

// ─── Скелетон ─────────────────────────────────────────────────────────────────
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