'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { AlbumCard, type AlbumCardData } from '@/entities/album/ui/AlbumCard';
import { ShowAllButton } from "@/shared/ui/ShowAllButton";

import 'swiper/css';
import 'swiper/css/free-mode';

interface NewReleasesSectionProps {
    sectionTitle?: string;
    albums?: AlbumCardData[];
    isLoading?: boolean;
    showAllHref?: string;
    onAlbumClick?: (id: string) => void;
}

export const NewReleasesSection = ({
                                       sectionTitle = 'Нові музичні релізи',
                                       albums,
                                       isLoading = false,
                                       showAllHref = '/albums',
                                       onAlbumClick,
                                   }: NewReleasesSectionProps) => {

    if (!isLoading && (!albums || albums.length === 0)) return null;

    return (
        <section className="new-releases-section mb-4 mb-md-5">
            <SectionHeader
                title={sectionTitle}
                highlightedWord="музичні"
                showAll
                showAllHref={showAllHref}
            />

            {isLoading ? (
                <div className="d-flex gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} style={{ minWidth: 150 }}>
                            <AlbumCardSkeleton />
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
                        992:  { slidesPerView: 3 },
                        1200: { slidesPerView: 7 },
                    }}
                    className="new-releases-section__swiper"
                >
                    {/* ФІКС: міняємо albumData на ітератор album та прокидаємо onClick */}
                    {albums?.map(album => (
                        <SwiperSlide key={album.id}>
                            <AlbumCard
                                album={album}
                                onClick={onAlbumClick}
                            />
                        </SwiperSlide>
                    ))}

                    <SwiperSlide className="new-releases-section__show-all-slide">
                        <div className="col-auto d-flex align-items-center h-100">
                            <ShowAllButton href={showAllHref}/>
                        </div>
                    </SwiperSlide>
                </Swiper>
            )}
        </section>
    );
};

const AlbumCardSkeleton = () => (
    <div>
        <div className="skeleton skeleton--rounded mb-2" style={{ aspectRatio: '1/1', width: '100%' }} />
        <div className="skeleton mb-1" style={{ height: 13, width: '75%' }} />
        <div className="skeleton mb-1" style={{ height: 11, width: '55%' }} />
        <div className="skeleton" style={{ height: 10, width: '40%' }} />
    </div>
);