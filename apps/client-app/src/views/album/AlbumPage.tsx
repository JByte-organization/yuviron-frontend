'use client';

import React, { useMemo } from 'react';
import { notFound } from 'next/navigation';
import {
    useGetApiAlbumsId,
    useGetApiAlbumsIdTracks,
    getGetApiAlbumsIdQueryKey,
    getGetApiAlbumsIdTracksQueryKey,
    type AlbumDetailsDto,
    type AlbumTrackItemDto,
    type TrackArtistDto,
} from '@repo/api/client.ts';

import { getImageUrl } from '@/shared/lib/getImageUrl';
import { useAvatarColor } from '@/shared/lib/useAvatarColor';
import { TrackRow, type TrackRowData } from '@/entities/track/ui/TrackRow';
import { AlbumHeader } from './ui/AlbumHeader';

interface AlbumPageProps {
    albumId: string;
}

// Інтерфейс для безпечного розгортання обгорток Orval/Axios
interface OrvalDataWrapper<T> {
    data?: T;
}

// Розширюємо стандартний DTO треку для підтримки необов'язкових полів без any
interface ExtendedAlbumTrackItem extends AlbumTrackItemDto {
    durationMs?: number | null;
    durationSeconds?: number | null;
    playsCount?: number;
    isLiked?: boolean;
}

// Безпечний універсальний анвраппер даних з суворою типізацією
const unwrapOrvalData = <T,>(rawResponse: unknown): T | undefined => {
    if (!rawResponse || typeof rawResponse !== 'object') return undefined;

    const wrapper = rawResponse as OrvalDataWrapper<T>;
    if (wrapper.data && typeof wrapper.data === 'object') {
        return wrapper.data;
    }
    return rawResponse as T;
};

export const AlbumPage = ({ albumId }: AlbumPageProps) => {

    // 1. Отримуємо дані метаданих та списку треків паралельно
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

    // Безпечно витягуємо типізовані структури через наш хелпер
    const album = unwrapOrvalData<AlbumDetailsDto>(albumRaw);

    const rawTracks = useMemo<ExtendedAlbumTrackItem[]>(() => {
        const list = unwrapOrvalData<ExtendedAlbumTrackItem[]>(tracksRaw);
        return Array.isArray(list) ? list : [];
    }, [tracksRaw]);

    // 2. Меомізація обчислених властивостей для Хедера
    const albumArtistsNames = useMemo<string[]>(() => {
        const artists = album?.artists as TrackArtistDto[] | null | undefined;
        if (!artists || artists.length === 0) return ['Невідомий виконавець'];
        return artists.map((a) => a.name || 'Невідомий виконавець');
    }, [album]);

    const albumReleaseYear = useMemo(() => {
        if (!album?.releaseDate) return null;
        return new Date(album.releaseDate).getFullYear();
    }, [album]);


    const albumCoverSrc = useMemo(() => {
        if (!album?.coverUrl) return '/images/album/placeholder.png';

        return getImageUrl(album.coverUrl) ?? '/images/album/placeholder.png';
    }, [album]);

    // 3. Обробка CORS проксі для коректного зчитування колірної палітри
    const proxiedCoverUrl = useMemo(() => {
        if (albumCoverSrc && albumCoverSrc.startsWith('http')) {
            return `/api/image-proxy?url=${encodeURIComponent(albumCoverSrc)}`;
        }
        return albumCoverSrc;
    }, [albumCoverSrc]);

    const detectedColor = useAvatarColor(album?.coverUrl ? proxiedCoverUrl : '');
    const dominantColor = detectedColor || '#282828';

    // 4. Безпечне зведення треків у формат TrackRowData
    const mappedTracks = useMemo<TrackRowData[]>(() => {
        const artistsList = album?.artists as TrackArtistDto[] | null | undefined;
        const mainArtistId = artistsList?.[0]?.id;

        return rawTracks.map((track, index) => {
            // Розраховуємо тривалість на основі наявних полей бекенду
            let calculatedDuration: number | null = null;
            if (track.durationMs) {
                calculatedDuration = track.durationMs;
            } else if (track.durationSeconds) {
                calculatedDuration = track.durationSeconds * 1000;
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
                isLiked:     track.isLiked ?? false,
                addedAt:     album?.releaseDate ?? null,
            };
        });
    }, [rawTracks, album, albumArtistsNames]);

    if (albumLoading || tracksLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center bg-neutral-950" style={{ minHeight: '50vh' }}>
                <div className="spinner-border text-light" role="status" />
            </div>
        );
    }

    if (!album) return notFound();

    return (
        <div className="album-page text-white">

            {/* Винесений підкомпонент хедера */}
            <AlbumHeader
                title={album.title ?? 'Без назви'}
                coverUrl={albumCoverSrc}
                artistsNames={albumArtistsNames.join(', ')}
                releaseYear={albumReleaseYear}
                tracksCount={album.tracksCount ?? 0}
                dominantColor={dominantColor}
            />

            {/* Блок панелі дій */}
            <div className="album-page__actions p-4 p-md-5 d-flex align-items-center gap-4 bg-black-20">
                <button className="btn btn-success rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: 56, height: 56 }}>
                    <i className="bi bi-play-fill fs-2 text-black" />
                </button>
                <button className="btn text-secondary p-0 fs-3 hover-white">
                    <i className="bi bi-shuffle" />
                </button>
                <button className="btn text-secondary p-0 fs-3 hover-white">
                    <i className="bi bi-plus-circle" />
                </button>
            </div>

            {/* Контейнер списку пісень */}
            <div className="album-page__tracks-container px-4 px-md-5 pb-5">
                {mappedTracks.length === 0 ? (
                    <p className="text-secondary">У цьому альбомі ще немає треків</p>
                ) : (
                    <div className="album-tracks-table">

                        {/* Шапка таблиці */}
                        <div className="row text-secondary small fw-bold pb-2 border-bottom border-secondary-subtle mb-3 px-3 d-none d-md-flex align-items-center">
                            <div className="col-auto text-end" style={{ width: 44 }}>#</div>
                            <div className="col">Назва</div>
                            <div className="col d-none d-md-block">Альбом</div>
                            <div className="col-auto text-end" style={{ width: 110 }}>
                                <i className="bi bi-clock me-4" />
                            </div>
                        </div>

                        {/* Перебір треків через сумісний TrackRow */}
                        <div className="d-flex flex-column gap-1">
                            {mappedTracks.map((trackItem) => (
                                <TrackRow
                                    key={trackItem.id}
                                    track={trackItem}
                                    allTracks={mappedTracks}
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