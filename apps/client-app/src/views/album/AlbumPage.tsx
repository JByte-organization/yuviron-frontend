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

// 🚨 ІМПОРТУЄМО КЕРУВАННЯ ПЛЕЄРОМ ТА СТОРОМ
import { usePlayer } from '@/entities/player/lib/usePlayer';
import { usePlayerStore } from '@/entities/player/model/playerStore';

interface AlbumPageProps {
    albumId: string;
}

interface OrvalDataWrapper<T> {
    data?: T;
}

interface ExtendedAlbumTrackItem extends AlbumTrackItemDto {
    durationMs?: number | null;
    durationSeconds?: number | null;
    playsCount?: number;
    isSaved?: boolean; // 🚨 Оновлено на наше реальне поле
    isLiked?: boolean; // Залишаємо для зворотної сумісності беку
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
    // ─── ІНІЦІАЛІЗАЦІЯ ХУКІВ ПЛЕЄРА ──────────────────────────────────────────
    const { playQueue, togglePlay } = usePlayer();
    const currentTrackId = usePlayerStore((s) => s.currentTrack?.id);
    const playerStatus   = usePlayerStore((s) => s.status);

    // 1. Паралельні запити до API
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

    const rawTracks = useMemo<ExtendedAlbumTrackItem[]>(() => {
        const list = unwrapOrvalData<ExtendedAlbumTrackItem[]>(tracksRaw);
        return Array.isArray(list) ? list : [];
    }, [tracksRaw]);

    // 2. Мемоізація метаданих для Хедера
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

    const proxiedCoverUrl = useMemo(() => {
        if (albumCoverSrc && albumCoverSrc.startsWith('http')) {
            return `/api/image-proxy?url=${encodeURIComponent(albumCoverSrc)}`;
        }
        return albumCoverSrc;
    }, [albumCoverSrc]);

    const detectedColor = useAvatarColor(album?.coverUrl ? proxiedCoverUrl : '');
    const dominantColor = detectedColor || '#282828';

    // 3. Зведення треків у формат TrackRowData
    const mappedTracks = useMemo<TrackRowData[]>(() => {
        const artistsList = album?.artists as TrackArtistDto[] | null | undefined;
        const mainArtistId = artistsList?.[0]?.id;

        return rawTracks.map((track, index) => {

            let calculatedDuration: number | null = null;

            // Зчитуємо будь-яке можливе поле, яке міг згенерувати Orval
            const rawDuration = (track as any).durationMs ?? (track as any).duration ?? (track as any).durationSeconds;

            if (typeof rawDuration === 'number') {
                // Якщо число велике (> 10000) — це мілісекунди. Якщо маленьке — секунди (множимо на 1000)
                calculatedDuration = rawDuration > 10000 ? rawDuration : rawDuration * 1000;
            } else if (typeof rawDuration === 'string') {
                // Якщо бек повернув C# TimeSpan рядок на кшталт "03:45" або "00:03:45"
                const parts = rawDuration.split(':').map(Number);
                if (parts.length === 3) {
                    // HH:MM:SS -> переводимо в мілісекунди
                    calculatedDuration = ((parts[0] * 3600) + (parts[1] * 60) + parts[2]) * 1000;
                } else if (parts.length === 2) {
                    // MM:SS -> переводимо в мілісекунди
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
                isSaved:     track.isSaved ?? track.isLiked ?? false,
                addedAt:     album?.releaseDate ?? null,
            };
        });
    }, [rawTracks, album, albumArtistsNames]);
    // ─── 4. РЕАКТИВНА ПЕРЕВІРКА: ЧИ ГРАЄ ЗАРАЗ ЦЕЙ АЛЬБОМ ──────────────────
    const isCollectionPlaying = useMemo(() => {
        if (playerStatus !== 'playing' || mappedTracks.length === 0) return false;
        return mappedTracks.some((t) => t.id === currentTrackId);
    }, [mappedTracks, currentTrackId, playerStatus]);

    // Послідовне відтворення альбому
    const handlePlayAll = () => {
        if (mappedTracks.length === 0) return;

        if (isCollectionPlaying) {
            togglePlay();
        } else {
            const queue = mappedTracks.map((t) => ({
                id:          t.id,
                title:       t.title,
                artistNames: t.artistNames,
                coverUrl:    t.coverUrl,
                durationMs:  t.durationMs ?? undefined,
            }));
            // Запускаємо з першої пісні, джерело — Альбом
            playQueue(queue, 0, 'Album', albumId);
        }
    };

    // Перемішане відтворення (Shuffle)
    const handleShufflePlay = () => {
        if (mappedTracks.length === 0) return;

        const shuffledTracks = [...mappedTracks].sort(() => Math.random() - 0.5);
        const queue = shuffledTracks.map((t) => ({
            id:          t.id,
            title:       t.title,
            artistNames: t.artistNames,
            coverUrl:    t.coverUrl,
            durationMs:  t.durationMs ?? undefined,
        }));
        playQueue(queue, 0, 'Album', albumId);
    };

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

            <AlbumHeader
                title={album.title ?? 'Без назви'}
                coverUrl={albumCoverSrc}
                artistsNames={albumArtistsNames.join(', ')}
                releaseYear={albumReleaseYear}
                tracksCount={album.tracksCount ?? 0}
                dominantColor={dominantColor}
            />

            {/* ─── 5. ОНОВЛЕНИЙ БЛОК ПАНЕЛІ ДІЙ (ЯК У FAVORITES) ───────────────── */}
            <div className="album-page__actions p-4 px-md-5 d-flex align-items-center gap-3 bg-black-20">
                {/* Велика кнопка Play/Pause */}
                <button
                    className={`favorites-header__btn favorites-header__btn--play${isCollectionPlaying ? ' favorites-header__btn--active' : ''}`}
                    onClick={handlePlayAll}
                    aria-label={isCollectionPlaying ? 'Pause' : 'Play'}
                >
                    <i className={`bi ${isCollectionPlaying ? 'bi-pause-fill' : 'bi bi-play-fill'}`} />
                </button>

                {/* Кнопка суворого клієнтського Shuffle */}
                <button
                    className="favorites-header__btn favorites-header__btn--icon"
                    onClick={handleShufflePlay}
                    aria-label="Shuffle"
                >
                    <i className="bi bi-shuffle" style={{ fontSize: '1.4rem' }} />
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

                        {/* Список треків */}
                        <div className="d-flex flex-column gap-1">
                            {mappedTracks.map((trackItem) => (
                                <TrackRow
                                    key={`${trackItem.id}-${trackItem.isSaved}`}
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