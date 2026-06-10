'use client';

import React, { useMemo } from 'react';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { ArtistCard, type ArtistCardData } from '@/entities/artist/ui/ArtistCard';
import { getImageUrl } from '@/shared/lib/getImageUrl';
import { useHasOverflow } from '@/shared/lib/useHasOverflow';
import type { SimilarArtistDto } from '@repo/api/client.ts';

interface ArtistSimilarArtistsSectionProps {
    artists?: SimilarArtistDto[];
    isLoading?: boolean;
    onArtistClick?: (id: string) => void;
}

export const ArtistSimilarArtistsSection = ({
                                                artists = [], // Избавились от MOCK_ARTISTS
                                                isLoading = false,
                                                onArtistClick,
                                            }: ArtistSimilarArtistsSectionProps) => {
    // Стрілки — лише коли контент переповнює слайдер (є що гортати).
    const [sliderRef, hasOverflow] = useHasOverflow<HTMLDivElement>([artists]);

    // ─── Маппинг данных из SimilarArtistDto в формат ArtistCardData ──────────
    const mappedArtists = useMemo<ArtistCardData[]>(() => {
        if (!artists || artists.length === 0) return [];

        return artists.map((a) => ({
            id:               a.id ?? '',
            name:             a.name ?? 'Невідомий виконавець',
            // Мапим followersCount в поле отображения подписчиков/слушателей
            monthlyListeners: a.followersCount ?? 0,
            avatarUrl:        getImageUrl(a.avatarUrl),
        }));
    }, [artists]);

    // Если загрузка завершена и похожих артистов нет — скрываем всю секцию
    if (!isLoading && mappedArtists.length === 0) return null;

    const scroll = (dir: 'prev' | 'next') => {
        if (!sliderRef.current) return;
        const amount = sliderRef.current.offsetWidth * 0.8;
        sliderRef.current.scrollBy({ left: dir === 'next' ? amount : -amount, behavior: 'smooth' });
    };

    return (
        <section className="artist-similar mb-5">
            <SectionHeader
                title="Шанувальникам також подобаються"
                highlightedWord="подобаються"
                onPrev={hasOverflow ? () => scroll('prev') : undefined}
                onNext={hasOverflow ? () => scroll('next') : undefined}
            />

            {isLoading ? (
                // Скелетоны теперь тоже красиво выстроены в ленту скролла
                <div className="section-slider-wrap">
                    <div className="d-flex gap-4 overflow-hidden">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="d-flex flex-column align-items-center gap-2" style={{ flex: '0 0 auto', width: 140 }}>
                                <div className="skeleton skeleton--circle" style={{ width: 120, height: 120 }} />
                                <div className="skeleton mt-1" style={{ height: 13, width: '80%' }} />
                                <div className="skeleton" style={{ height: 11, width: '50%' }} />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="section-slider-wrap">
                    <div
                        ref={sliderRef}
                        className="row g-4 flex-nowrap overflow-x-auto artist-slider"
                    >
                        {mappedArtists.map((artist) => (
                            <div key={artist.id} className="col-auto" style={{ flex: '0 0 auto' }}>
                                <ArtistCard artist={artist} onClick={onArtistClick} />
                            </div>
                        ))}
                        <div className="col-auto" style={{ minWidth: 20 }} />
                    </div>
                </div>
            )}
        </section>
    );
};