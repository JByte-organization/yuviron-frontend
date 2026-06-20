'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuthGuard } from '@/shared/lib/useAuthGuard';
import { usePlayer } from '@/entities/player/lib/usePlayer';
import { usePlayerStore } from '@/entities/player/model/playerStore';
import { getImageUrl } from '@/shared/lib/getImageUrl';
import { useFavoriteTrack } from '@/features/track/lib/useFavoriteTrack';
import { useQueryClient } from '@tanstack/react-query';

import {
    useGetApiMePlaylists,
    usePostApiMePlaylistsIdTracks,
    type UserPlaylistDto
} from '@repo/api/client.ts';
import { TrackContextMenu } from '@/features/track/ui/TrackContextMenu';
import { AddToPlaylistModal } from '@/features/playlist/add/ui/AddToPlaylistModal';
import { usePlaylistToast } from '@/shared/ui/PlaylistToast';

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
    isSaved?: boolean;
}

interface TrackRowProps {
    track: TrackRowData;
    allTracks?: TrackRowData[];
    variant?: TrackRowVariant;
    onClick?: (id: string) => void;
    sourceType?: 'Playlist' | 'Album' | 'Search' | 'ArtistProfile';
    sourceId?: string | null;
}

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
                             sourceType = 'Search',
                             sourceId = null,
                         }: TrackRowProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [menuCoords, setMenuCoords] = useState<{ x: number; y: number } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { requireAuth, isAuthenticated } = useAuthGuard();
    const { playQueue } = usePlayer();
    const { showToast } = usePlaylistToast();
    const queryClient = useQueryClient();

    const currentTrackId = usePlayerStore(s => s.currentTrack?.id);
    const playerStatus   = usePlayerStore(s => s.status);


    const { isLiked, toggle: toggleLike } = useFavoriteTrack({
        initialLiked: track.isSaved ?? false,
    });

    const isCurrentlyPlaying = currentTrackId === track.id && playerStatus === 'playing';
    const coverSrc = getImageUrl(track.coverUrl) ?? `https://picsum.photos/seed/track-${track.id}/40/40`;

    const { data: playlistsRaw } = useGetApiMePlaylists(
        { PageSize: 7 },
        {
            query: {
                queryKey: ['getApiMePlaylists', { PageSize: 7 }],
                enabled: isAuthenticated,
            }
        }
    );
    const { mutateAsync: addTrackToPlaylist } = usePostApiMePlaylistsIdTracks();

    const quickPlaylists = useMemo(() => {
        if (!playlistsRaw) return [];
        const obj = playlistsRaw as Record<string, unknown>;
        const list = (Array.isArray(obj.data) ? obj.data : Array.isArray(obj.items) ? obj.items : Array.isArray(playlistsRaw) ? playlistsRaw : []) as UserPlaylistDto[];

        return list.map(p => ({
            id: p.id ?? '',
            title: p.title ?? 'Без назви',
            isSaved:     track.isSaved ?? false
        }));
    }, [playlistsRaw, track.isSaved]);

    const handleQuickAddToPlaylist = async (playlistId: string) => {
        const targetPlaylist = quickPlaylists.find(p => p.id === playlistId);
        try {
            await addTrackToPlaylist({
                id: playlistId,
                data: { trackId: track.id } as Parameters<typeof addTrackToPlaylist>[0]['data']
            });

            showToast({
                trackId: track.id,
                trackTitle: track.title,
                playlistId,
                playlistName: targetPlaylist?.title ?? 'Плейліст',
            });
            void queryClient.invalidateQueries({ queryKey: ['getApiMePlaylists'] });
        } catch (error) {
            console.error('[TrackRow] Не вдалося швидко додати трек:', error);
        }
    };

    const handleClick = () => {
        requireAuth(() => {
            onClick?.(track.id);
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

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        const xPos = e.clientX > window.innerWidth - 240 ? window.innerWidth - 250 : e.clientX;
        setMenuCoords({ x: xPos, y: e.clientY });
    };

    const handleThreeDotsClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        setMenuCoords({ x: rect.left - 200, y: rect.bottom + 6 });
    };

    return (
        <div
            className={`track-row${isCurrentlyPlaying ? ' track-row--playing' : ''}${isHovered ? ' track-row--hovered' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
        >
            <div className="track-row__index">
                {isCurrentlyPlaying ? (
                    <i className="bi bi-volume-up-fill track-row__playing-icon" />
                ) : isHovered ? (
                    isAuthenticated ? <i className="bi bi-play-fill" /> : <i className="bi bi-lock-fill text-muted" />
                ) : (
                    <span>{track.index}</span>
                )}
            </div>

            <div className="track-row__info">
                <div className="track-row__cover"><img src={coverSrc} alt={track.title} /></div>
                <div className="track-row__meta">
                    <Link href={`/tracks/${track.id}`} className={`track-row__title${isCurrentlyPlaying ? ' track-row__title--playing' : ''}`} onClick={e => e.stopPropagation()}>{track.title}</Link>
                    {track.artistId ? (
                        <Link href={`/artists/${track.artistId}`} className="track-row__artist" onClick={e => e.stopPropagation()}>{track.artistNames.join(', ')}</Link>
                    ) : (
                        <span className="track-row__artist">{track.artistNames.join(', ')}</span>
                    )}
                </div>
            </div>

            <div className="track-row__album d-none d-md-block">
                {track.albumId ? <Link href={`/albums/${track.albumId}`} className="track-row__album-link" onClick={e => e.stopPropagation()}>{track.albumTitle ?? '—'}</Link> : <span>{track.albumTitle ?? '—'}</span>}
            </div>

            <div className="track-row__context d-none d-lg-block">
                {variant === 'artist' ? <span>{formatPlays(track.playsCount)}</span> : <span>{formatDate(track.addedAt)}</span>}
            </div>

            <div className="track-row__actions">
                <button className={`track-row__like-btn${isLiked ? ' track-row__like-btn--active' : ''}`} onClick={handleLike}>
                    <i className={isLiked ? 'bi bi-heart-fill' : 'bi bi-heart'} />
                </button>

                <span className="track-row__duration">{formatDuration(track.durationMs)}</span>

                {isHovered && (
                    <button className="track-row__more-btn btn btn-link p-0 text-secondary ms-2" onClick={handleThreeDotsClick}>
                        <i className="bi bi-three-dots" style={{ fontSize: '1.2rem' }} />
                    </button>
                )}
            </div>

            {menuCoords && (
                <TrackContextMenu
                    x={menuCoords.x}
                    y={menuCoords.y}
                    trackId={track.id}
                    trackTitle={track.title}
                    artistId={track.artistId}
                    artistNames={track.artistNames}
                    isLiked={isLiked}
                    onClose={() => setMenuCoords(null)}
                    onToggleLike={() => toggleLike(track.id)}
                    myPlaylists={quickPlaylists}
                    onAddToPlaylist={handleQuickAddToPlaylist}
                    onCreatePlaylist={() => { setMenuCoords(null); setIsModalOpen(true); }}
                    onOpenModal={() => { setMenuCoords(null); setIsModalOpen(true); }}
                />
            )}

            {isModalOpen && (
                <AddToPlaylistModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    trackId={track.id}
                    trackTitle={track.title}
                    onCreatePlaylist={() => console.log('Виклик модалки створення плейліста')}
                />
            )}
        </div>
    );
};