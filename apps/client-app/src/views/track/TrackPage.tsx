'use client';

import React, { useMemo } from 'react';
import { notFound } from 'next/navigation';
import { useGetApiTracksId, getGetApiTracksIdQueryKey, type TrackDetailsDto } from '@repo/api/client';
import { getImageUrl } from '@/shared/lib/getImageUrl';

import { TrackPageHeader } from './ui/TrackPageHeader';
import { TrackRecommendationsSection } from './ui/TrackRecommendationsSection';
import { ArtistTopTracksSection } from './ui/ArtistTopTracksSection';
import { ArtistAlbumsSection } from './ui/ArtistAlbumsSection';

interface TrackPageProps {
    trackId: string;
}

interface OrvalResponseWrapper<T> {
    data?: T;
}

export const TrackPage = ({ trackId }: TrackPageProps) => {
    // 1. Отримуємо дані основного треку сторінки з обов'язковим ключем квесту
    const { data: trackRaw, isLoading } = useGetApiTracksId(trackId, {
        query: {
            enabled: !!trackId,
            queryKey: getGetApiTracksIdQueryKey(trackId), // Захист від помилки TS2741
        }
    });

    // Безпечний розворот даних без використання any
    const track = useMemo<TrackDetailsDto | undefined>(() => {
        if (!trackRaw) return undefined;
        const response = trackRaw as OrvalResponseWrapper<TrackDetailsDto>;
        return response.data ?? (trackRaw as TrackDetailsDto);
    }, [trackRaw]);

    // 2. Безпечно витягуємо дані головного виконавця
    const mainArtist = track?.artists?.[0];
    const artistId = mainArtist?.id ?? '';
    const artistName = mainArtist?.name ?? 'Невідомий виконавець';

    const coverSrc = useMemo(() => {
        if (!track?.coverUrl) return '/images/track/track-placeholder.png';
        return getImageUrl(track.coverUrl) ?? '/images/track/track-placeholder.png';
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
                albumTitle={track.albumTitle ?? 'Сінгл'} // ФІКС: використовуємо пласке поле зі Сваггера замість track.album.title
                year="—" // Оскільки в TrackDetailsDto немає дати релізу, передаємо дефолтний прочерк
                durationMs={track.durationMs ?? 0} // ФІКС: durationMs є в DTO, тому прибираємо any касти
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