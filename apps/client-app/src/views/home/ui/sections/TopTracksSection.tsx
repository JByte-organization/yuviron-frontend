'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { ShowAllButton } from '@/shared/ui/ShowAllButton';
import { TrackCard, type TrackCardData } from '@/entities/track/ui/TrackCard';

import 'swiper/css';
import 'swiper/css/free-mode';

// ─── Типи ─────────────────────────────────────────────────────────────────────
interface TopTracksSectionProps {
    sectionTitle?: string;
    tracks?: TrackCardData[];
    isLoading?: boolean;
    showAllHref?: string;
    onTrackClick?: (id: string) => void;
}

// ─── Компонент ────────────────────────────────────────────────────────────────
// Секція відповідає тільки за відображення.
// Дані (tracks, isLoading) приходять з батьківського компонента (HomePage або LibraryPage).
// Це дозволяє перевикористовувати секцію з різними хуками.
export const TopTracksSection = ({
                                     sectionTitle = 'Топ популярна музика',
                                     tracks,
                                     isLoading = false,
                                     showAllHref = '/tracks',
                                     onTrackClick,
                                 }: TopTracksSectionProps) => {

    if (!isLoading && (!tracks || tracks.length === 0)) return null;

    const lastWord = sectionTitle.trim().split(' ').at(-1) ?? 'музика';

    return (
        <section className="top-tracks-section mb-4 mb-md-5">
            <SectionHeader
                title={sectionTitle}
                highlightedWord={lastWord}
                showAll
                showAllHref={showAllHref}
            />

            {isLoading ? (
                <div className="d-flex gap-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} style={{ minWidth: 150 }}>
                            <TrackCardSkeleton />
                        </div>
                    ))}
                </div>
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
                    className="top-tracks-section__swiper"
                >
                    {tracks!.map(track => (
                        <SwiperSlide key={track.id}>
                            <TrackCard track={track} onClick={onTrackClick} />
                        </SwiperSlide>
                    ))}

                    <SwiperSlide className="top-tracks-section__show-all-slide align-items-center my-auto mx-0">
                        <ShowAllButton href={showAllHref} />
                    </SwiperSlide>
                </Swiper>
            )}
        </section>
    );
};

// ─── Скелетон ─────────────────────────────────────────────────────────────────
const TrackCardSkeleton = () => (
    <div>
        <div className="skeleton skeleton--rounded mb-2" style={{ aspectRatio: '1/1' }} />
        <div className="skeleton mb-1" style={{ height: 13, width: '75%' }} />
        <div className="skeleton" style={{ height: 11, width: '55%' }} />
    </div>
);