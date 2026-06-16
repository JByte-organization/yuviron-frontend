'use client';

import React, { useMemo } from 'react';
import { notFound } from 'next/navigation';
import {
    useGetApiAlbumsId,
    useGetApiAlbumsIdTracks,
    getGetApiAlbumsIdQueryKey,
    getGetApiAlbumsIdTracksQueryKey,
    type AlbumDetailsDto,
    type TrackArtistDto,
} from '@repo/api/client.ts';

import { getImageUrl } from '@/shared/lib/getImageUrl';
import { useAvatarColor } from '@/shared/lib/useAvatarColor';
import { TrackRow, type TrackRowData } from '@/entities/track/ui/TrackRow';
import { AlbumHeader } from './ui/AlbumHeader';
import { useTrackCollection } from '@/shared/lib/useTrackCollection';

interface AlbumPageProps {
    albumId: string;
}

interface OrvalDataWrapper<T> {
    data?: T;
}

const unwrapOrvalData = <T,>(rawResponse: unknown): T | undefined => {
    if (!rawResponse || typeof rawResponse !== 'object') return undefined;
    const wrapper = rawResponse as OrvalDataWrapper<T>;
    if (wrapper.data && typeof wrapper.data === 'object') {
        return wrapper.data;
    }
    return rawResponse as T;
};

export const AlbumPage = ({ albumId }: AlbumPageProps) => {
    // 1. Запросы к API
    const { data: albumRaw, isLoading: albumLoading } = useGetApiAlbumsId(
        albumId,
        {
            query: {
                enabled: !!albumId,
                queryKey: getGetApiAlbumsIdQueryKey(albumId),
            },
        }
    );

    const { data: tracksRaw, isLoading: tracksLoading } = useGetApiAlbumsIdTracks(
        albumId,
        {
            query: {
                enabled: !!albumId,
                queryKey: getGetApiAlbumsIdTracksQueryKey(albumId),
            },
        }
    );

    const album = unwrapOrvalData<AlbumDetailsDto>(albumRaw);

    // 🌟 ХУКИ ВЫЗЫВАЕМ СТРОГО В САМОМ ВЕРХУ ДО ЛЮБЫХ RETURN!
    const albumCoverSrc = useMemo(() => {
        if (!album?.coverUrl) return '/images/album/placeholder.png';
        return getImageUrl(album.coverUrl) ?? '/images/album/placeholder.png';
    }, [album]);

    const proxiedCoverUrl = useMemo(() => {
        if (albumCoverSrc && albumCoverSrc.startsWith('http')) {
            return `/api/image-proxy?url=${encodeURIComponent(albumCoverSrc)}`;
        }
        return albumCoverSrc;
    }, [albumCoverSrc]);

    // 🌟 Переносим вызов хука useAvatarColor СЮДА (до условий загрузки)
    const detectedColor = useAvatarColor(album?.coverUrl ? proxiedCoverUrl : '');
    const dominantColor = detectedColor || '#282828';

    const rawTracks = useMemo(() => {
        const list = unwrapOrvalData<any[]>(tracksRaw);
        return Array.isArray(list) ? list : [];
    }, [tracksRaw]);

    const albumArtistsNames = useMemo<string[]>(() => {
        const artists = album?.artists as TrackArtistDto[] | null | undefined;
        if (!artists || artists.length === 0) return ['Невідомий виконавець'];
        return artists.map((a) => a.name || 'Невідомий виконавець');
    }, [album]);

    const albumReleaseYear = useMemo(() => {
        if (!album?.releaseDate) return null;
        return new Date(album.releaseDate).getFullYear();
    }, [album]);

    const mappedTracks: TrackRowData[] = useMemo(() => {
        const artistsList = album?.artists as TrackArtistDto[] | null | undefined;
        const mainArtistId = artistsList?.[0]?.id;

        return rawTracks.map((track, index) => {
            let calculatedDuration: number | null = null;
            const rawDuration = (track as any).durationMs ?? (track as any).duration ?? (track as any).durationSeconds;

            if (typeof rawDuration === 'number') {
                calculatedDuration = rawDuration > 10000 ? rawDuration : rawDuration * 1000;
            } else if (typeof rawDuration === 'string') {
                const parts = rawDuration.split(':').map(Number);
                if (parts.length === 3) {
                    calculatedDuration = ((parts[0] * 3600) + (parts[1] * 60) + parts[2]) * 1000;
                } else if (parts.length === 2) {
                    calculatedDuration = ((parts[0] * 60) + parts[1]) * 1000;
                }
            }

            return {
                id:          track.id ?? '',
                index:       track.albumPosition ?? index + 1,
                title:       track.title ?? 'Без назви',
                artistNames: albumArtistsNames,
                artistId:    mainArtistId,
                albumId:     album?.id,
                albumTitle:  album?.title ?? 'Без назви',
                coverUrl:    album?.coverUrl,
                durationMs:  calculatedDuration,
                playsCount:  track.playsCount ?? 0,
                isSaved:     track.isSaved ?? false,
                addedAt:     album?.releaseDate ?? null,
            };
        });
    }, [rawTracks, album, albumArtistsNames]);

    const {
        processedTracks,
        isCollectionPlaying,
        handlePlayAll,
        handleShufflePlay,
    } = useTrackCollection({
        rawTracks: mappedTracks,
        sourceType: 'Album',
        sourceId: albumId,
        hideControls: true
    });

    // 🌟 ТЕПЕРЬ УСЛОВИЯ РАННЕГО ВЫХОДА НАХОДЯТСЯ ПОД ВСЕМИ ХУКАМИ
    if (albumLoading || tracksLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center bg-neutral-950" style={{ minHeight: '50vh' }}>
                <div className="spinner-border text-light" role="status" />
            </div>
        );
    }

    if (!album) return notFound();

    return (
        <div className="album-page text-white" style={{ '--album-bg': dominantColor } as React.CSSProperties}>
            <AlbumHeader
                title={album.title ?? 'Без назви'}
                coverUrl={albumCoverSrc}
                artistsNames={albumArtistsNames.join(', ')}
                releaseYear={albumReleaseYear}
                tracksCount={album.tracksCount ?? 0}
                dominantColor={dominantColor}
                isCollectionPlaying={isCollectionPlaying}
                onPlayAll={handlePlayAll}
                onShufflePlay={handleShufflePlay}
            />


            <div className="album-page__tracks-container px-4 px-md-5 pb-5">
                {processedTracks.length === 0 ? (
                    <p className="text-secondary">У цьому альбомі ще немає треків</p>
                ) : (
                    <div className="album-tracks-table">
                        <div className="row text-secondary small fw-bold pb-2 border-bottom border-secondary-subtle mb-3 px-3 d-none d-md-flex align-items-center">
                            <div className="col-auto text-end" style={{ width: 44 }}>#</div>
                            <div className="col">Назва</div>
                            <div className="col d-none d-md-block">Альбом</div>
                            <div className="col-auto text-end" style={{ width: 110 }}>
                                <i className="bi bi-clock me-4" />
                            </div>
                        </div>

                        <div className="d-flex flex-column gap-1">
                            {processedTracks.map((trackItem) => (
                                <TrackRow
                                    key={`${trackItem.id}-${trackItem.isSaved}`}
                                    track={trackItem}
                                    allTracks={processedTracks}
                                    sourceType="Album"
                                    sourceId={albumId}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};