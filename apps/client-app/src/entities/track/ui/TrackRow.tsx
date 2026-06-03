'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuthGuard } from '@/shared/lib/useAuthGuard';
import { usePlayer } from '@/entities/player/lib/usePlayer';
import { usePlayerStore } from '@/entities/player/model/playerStore';
import { getImageUrl } from '@/shared/lib/getImageUrl';
import { useFavoriteTrack } from '@/features/track/lib/useFavoriteTrack';

export type TrackRowVariant = 'default' | 'artist';

export interface TrackRowData {
    id: string;
    index: number;
    title: string;
    artistNames: string[];
    artistId?: string;
    albumId?: string;
    albumTitle?: string | null;
    addedAt?: string | null;
    durationMs?: number | null;
    coverUrl?: string | null;
    playsCount?: number;
    isLiked?: boolean;
}

interface TrackRowProps {
    track: TrackRowData;
    allTracks?: TrackRowData[];
    isPlaying?: boolean;
    variant?: TrackRowVariant;
    onClick?: (id: string) => void;
    onAddToPlaylist?: (id: string) => void;
    showAddToPlaylist?: boolean;
    sourceType?: 'Playlist' | 'Album' | 'Search' | 'ArtistProfile';
    sourceId?: string | null;
}

// Хелперы выносим или оставляем — они написаны правильно
const formatDuration = (ms?: number | null): string => {
    if (!ms) return '—';
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
};

const formatDate = (dateStr?: string | null): string => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Сьогодні';
    if (diffDays === 1) return 'Вчора';
    return date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatPlays = (count?: number): string => {
    if (!count) return '—';
    return count.toLocaleString('uk-UA');
};

export const TrackRow = ({
                             track,
                             allTracks,
                             variant = 'default',
                             onClick,
                             onAddToPlaylist,
                             showAddToPlaylist = false,
                             sourceType = 'Search',
                             sourceId = null,
                         }: TrackRowProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const { requireAuth } = useAuthGuard();
    const { playQueue } = usePlayer();
    const currentTrackId = usePlayerStore(s => s.currentTrack?.id);
    const playerStatus   = usePlayerStore(s => s.status);

    const { isLiked, isPending: isLikePending, toggle: toggleLike } = useFavoriteTrack({
        initialLiked: track.isLiked ?? false,
    });

    const isCurrentlyPlaying = currentTrackId === track.id && playerStatus === 'playing';

    const coverSrc = getImageUrl(track.coverUrl)
        ?? `https://picsum.photos/seed/track-${track.id}/40/40`;

    // 🚨 ФИКС ОЧЕРЕДИ ДЛЯ СТРОК: Строка теперь сама умеет прокидывать весь список треков страницы в плеер
    const handleClick = () => {
        requireAuth(() => {
            // Вызываем внешний клик только как сайд-эффект (если он нужен родителю)
            onClick?.(track.id);

            // Собираем полную очередь из списка треков на странице плейлиста/альбома
            const queue = allTracks && allTracks.length > 0 ? allTracks : [track];
            const index = queue.findIndex(t => t.id === track.id);

            playQueue(
                queue.map(t => ({
                    id:          t.id,
                    title:       t.title,
                    artistNames: t.artistNames,
                    artistId:    t.artistId,
                    albumId:     t.albumId,
                    albumTitle:  t.albumTitle ?? undefined,
                    coverUrl:    t.coverUrl,
                    durationMs:  t.durationMs ?? undefined,
                })),
                index >= 0 ? index : 0,
                sourceType,
                sourceId,
            );
        });
    };

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        requireAuth(() => toggleLike(track.id));
    };

    return (
        <div
            className={`track-row track-row--${variant}${isCurrentlyPlaying ? ' track-row--playing' : ''}${isHovered ? ' track-row--hovered' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleClick}
        >
            <div className="track-row__index">
                {isCurrentlyPlaying ? (
                    <i className="bi bi-volume-up-fill track-row__playing-icon" />
                ) : isHovered ? (
                    <i className="bi bi-play-fill" />
                ) : (
                    <span>{track.index}</span>
                )}
            </div>

            <div className="track-row__info">
                <div className="track-row__cover">
                    <img src={coverSrc} alt={track.title} />
                </div>
                <div className="track-row__meta">
                    <Link
                        href={`/tracks/${track.id}`}
                        className={`track-row__title${isCurrentlyPlaying ? ' track-row__title--playing' : ''}`}
                        onClick={e => e.stopPropagation()}
                    >
                        {track.title}
                    </Link>
                    {track.artistId ? (
                        <Link
                            href={`/artists/${track.artistId}`}
                            className="track-row__artist"
                            onClick={e => e.stopPropagation()}
                        >
                            {track.artistNames.join(', ')}
                        </Link>
                    ) : (
                        <span className="track-row__artist">{track.artistNames.join(', ')}</span>
                    )}
                </div>
            </div>

            <div className="track-row__album d-none d-md-block">
                {track.albumId ? (
                    <Link
                        href={`/albums/${track.albumId}`}
                        className="track-row__album-link"
                        onClick={e => e.stopPropagation()}
                    >
                        {track.albumTitle ?? '—'}
                    </Link>
                ) : (
                    <span>{track.albumTitle ?? '—'}</span>
                )}
            </div>

            <div className="track-row__context d-none d-lg-block">
                {variant === 'artist'
                    ? <span>{formatPlays(track.playsCount)}</span>
                    : <span>{formatDate(track.addedAt)}</span>
                }
            </div>

            <div className="track-row__actions">
                <button
                    className={`track-row__like-btn${isLiked ? ' track-row__like-btn--active' : ''}`}
                    onClick={handleLike}
                    disabled={isLikePending}
                    aria-label={isLiked ? 'Прибрати з улюблених' : 'Додати до улюблених'}
                >
                    <i className={isLiked ? 'bi bi-heart-fill' : 'bi bi-heart'} />
                </button>

                <span className="track-row__duration">
                    {formatDuration(track.durationMs)}
                </span>

                {showAddToPlaylist && (
                    <button
                        className="track-row__add-btn"
                        onClick={e => { e.stopPropagation(); onAddToPlaylist?.(track.id); }}
                        aria-label="Додати до плейліста"
                    >
                        <i className="bi bi-plus-circle" />
                    </button>
                )}
            </div>
        </div>
    );
};