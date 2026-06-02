'use client';

import React, { useMemo } from 'react';
import { notFound } from 'next/navigation';
import { useGetApiTracksId, type TrackDetailsDto } from '@repo/api/client';
import { getImageUrl } from '@/shared/lib/getImageUrl';

import { TrackPageHeader } from './ui/TrackPageHeader';
import { TrackRecommendationsSection } from './ui/TrackRecommendationsSection';
import { ArtistTopTracksSection } from './ui/ArtistTopTracksSection';
import { ArtistAlbumsSection } from './ui/ArtistAlbumsSection';

interface TrackPageProps {
    trackId: string;
}

interface OrvalResponse<T> {
    data?: T;
}

export const TrackPage = ({ trackId }: TrackPageProps) => {
    // 1. Отримуємо дані основного треку сторінки
    const { data: trackRaw, isLoading } = useGetApiTracksId(trackId, {
        query: {
            enabled: !!trackId,
        }
    });

    const track = useMemo<TrackDetailsDto | undefined>(() => {
        if (!trackRaw) return undefined;
        const response = trackRaw as OrvalResponse<TrackDetailsDto>;
        return response.data ?? (trackRaw as TrackDetailsDto);
    }, [trackRaw]);

    // 2. Безпечно витягуємо дані головного виконавця для дочірніх секцій
    const mainArtist = track?.artists?.[0];
    const artistId = mainArtist?.id ?? '';
    const artistName = mainArtist?.name ?? 'Невідомий виконавець';

    const coverSrc = useMemo(() => {
        if (!track?.coverUrl) return '/images/track/track-placeholder.png';
        return getImageUrl(track.coverUrl) ?? '/images/track/track-placeholder.png';
    }, [track]);

    const releaseYear = useMemo(() => {
        if (!track?.releaseDate) return '—';
        return new Date(track.releaseDate).getFullYear().toString();
    }, [track]);

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center bg-neutral-950" style={{ minHeight: '60vh' }}>
                <div className="spinner-border text-light" role="status" />
            </div>
        );
    }

    if (!track) return notFound();

    return (
        <div className="track-page text-white">
            {/* Хедер треку */}
            <TrackPageHeader
                trackId={track.id ?? ''}
                title={track.title ?? 'Без назви'}
                artistName={artistName}
                albumTitle={track.album?.title ?? 'Сінгл'}
                year={releaseYear}
                durationMs={(track as any).durationMs ?? ((track as any).durationSeconds ? (track as any).durationSeconds * 1000 : 0)}
                coverUrl={coverSrc}
                onPlay={() => console.log('play')}
                onLike={() => console.log('like')}
                onAddToPlaylist={() => console.log('add')}
            />

            <TrackRecommendationsSection trackId={trackId} />

            {artistId && (
                <ArtistTopTracksSection
                    artistId={artistId}
                    artistName={artistName}
                />
            )}

            {artistId && (
                <ArtistAlbumsSection
                    artistId={artistId}
                    artistName={artistName}
                />
            )}
        </div>
    );
};