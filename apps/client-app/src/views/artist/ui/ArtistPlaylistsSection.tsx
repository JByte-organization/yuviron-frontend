'use client';

import React, { useMemo } from 'react';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { PlaylistCard } from '@/entities/playlist/ui/PlaylistCard';
import { getImageUrl } from '@/shared/lib/getImageUrl';
import { useHasOverflow } from '@/shared/lib/useHasOverflow';
import type { ArtistPlaylistDto } from '@repo/api/client.ts';

interface ArtistPlaylistsSectionProps {
    artistName: string;
    playlists?: ArtistPlaylistDto[];
    isLoading?: boolean;
    onPlaylistClick?: (id: string) => void;
}

export const ArtistPlaylistsSection = ({
                                           artistName,
                                           playlists = [], // Избавились от MOCK_PLAYLISTS
                                           isLoading = false,
                                           onPlaylistClick,
                                       }: ArtistPlaylistsSectionProps) => {
    // Стрілки — лише коли контент переповнює слайдер (є що гортати).
    const [sliderRef, hasOverflow] = useHasOverflow<HTMLDivElement>([playlists]);

    // ─── Маппинг данных из ArtistPlaylistDto в формат PlaylistCardData ────────
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

    // Если загрузка завершена и плейлистов нет — скрываем всю секцию
    if (!isLoading && mappedPlaylists.length === 0) return null;

    const scroll = (dir: 'prev' | 'next') => {
        if (!sliderRef.current) return;
        const amount = sliderRef.current.offsetWidth * 0.8;
        sliderRef.current.scrollBy({ left: dir === 'next' ? amount : -amount, behavior: 'smooth' });
    };

    return (
        <section className="artist-playlists mb-5">
            <SectionHeader
                title={`${artistName}: плейлісти виконавця`}
                highlightedWord="плейлісти"
                onPrev={hasOverflow ? () => scroll('prev') : undefined}
                onNext={hasOverflow ? () => scroll('next') : undefined}
            />

            {isLoading ? (
                // Скелетоны теперь тоже красиво выстроены в горизонтальную ленту
                <div className="section-slider-wrap">
                    <div className="row g-3 flex-nowrap overflow-hidden">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="col-6 col-md-4 col-lg-2" style={{ flex: '0 0 auto' }}>
                                <div className="skeleton skeleton--rounded" style={{ aspectRatio: '1/1' }} />
                                <div className="skeleton mt-2" style={{ height: 13, width: '75%' }} />
                                <div className="skeleton mt-1" style={{ height: 11, width: '40%' }} />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="section-slider-wrap">
                    <div
                        ref={sliderRef}
                        className="row g-3 flex-nowrap overflow-x-auto artist-slider"
                    >
                        {mappedPlaylists.map((playlist) => (
                            <div key={playlist.id} className="col-6 col-md-4 col-lg-2" style={{ flex: '0 0 auto' }}>
                                <PlaylistCard playlist={playlist} onClick={onPlaylistClick} />
                            </div>
                        ))}
                        <div className="col-auto" style={{ minWidth: 40 }} />
                    </div>
                </div>
            )}
        </section>
    );
};