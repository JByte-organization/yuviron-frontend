'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthGuard } from '@/shared/lib/useAuthGuard';
import { getImageUrl } from '@/shared/lib/getImageUrl';
import { usePlayer } from '@/entities/player/lib/usePlayer';
import { usePlayerStore } from '@/entities/player/model/playerStore';
import { useFavoriteTrack } from '@/features/track/lib/useFavoriteTrack';
import { usePlaylistToast } from '@/shared/ui/PlaylistToast';

import {
    useGetApiMePlaylists,
    usePostApiMePlaylistsIdTracks,
    type UserPlaylistDto
} from '@repo/api/client.ts';
import { TrackContextMenu } from '@/features/track/ui/TrackContextMenu';
import { AddToPlaylistModal } from '@/features/playlist/add/ui/AddToPlaylistModal';

export interface TrackCardData {
    id: string;
    title: string;
    artistNames: string[];
    artistId?: string;
    coverUrl?: string | null;
    durationMs?: number;
    isSaved?: boolean; // 🚨 ОНОВЛЕНО: Тепер це реальне поле з API замість TODO
}

interface TrackCardProps {
    track: TrackCardData;
    onClick?: () => void;
}

export const TrackCard = ({ track, onClick }: TrackCardProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [menuCoords, setMenuCoords] = useState<{ x: number; y: number } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const coverSrc = getImageUrl(track.coverUrl)
        ?? `https://picsum.photos/seed/track-${track.id}/300/300`;

    const { playQueue } = usePlayer();
    const { requireAuth } = useAuthGuard();
    const { showToast } = usePlaylistToast();
    const queryClient = useQueryClient();

    const currentTrackId = usePlayerStore(s => s.currentTrack?.id);
    const playerStatus   = usePlayerStore(s => s.status);

    const isCurrentlyPlaying = currentTrackId === track.id && playerStatus === 'playing';

    // 🚨 ОНОВЛЕНО: Підключаємо ініціалізацію лайку до реального поля isSaved
    const { isLiked, isPending: isLikePending, toggle: toggleLike } = useFavoriteTrack({
        initialLiked: track.isSaved ?? false,
    });

    const { data: playlistsRaw } = useGetApiMePlaylists({ PageSize: 7 });
    const { mutateAsync: addTrackToPlaylist } = usePostApiMePlaylistsIdTracks();

    const quickPlaylists = useMemo(() => {
        if (!playlistsRaw) return [];
        const obj = playlistsRaw as Record<string, unknown>;
        const list = (Array.isArray(obj.data) ? obj.data : Array.isArray(obj.items) ? obj.items : Array.isArray(playlistsRaw) ? playlistsRaw : []) as UserPlaylistDto[];

        return list.map(p => ({
            id: p.id ?? '',
            title: p.title ?? 'Без назви'
        }));
    }, [playlistsRaw]);

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
            console.error('[TrackCard] Помилка швидкого додавання треку:', error);
        }
    };

    const handleClick = () => {
        requireAuth(() => {
            if (onClick) {
                onClick();
            } else {
                playQueue([track], 0, 'Search', null);
            }
        });
    };

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        requireAuth(() => toggleLike(track.id));
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const menuWidth = 240;
        const xPos = e.clientX > window.innerWidth - menuWidth ? window.innerWidth - (menuWidth + 20) : e.clientX;
        const menuHeight = 200;
        const yPos = e.clientY > window.innerHeight - menuHeight ? window.innerHeight - (menuHeight + 20) : e.clientY;

        setMenuCoords({ x: xPos, y: yPos });
    };

    return (
        <div
            className={`track-card${isCurrentlyPlaying ? ' track-card--playing' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
        >
            <div className="track-card__cover">
                <img src={coverSrc} alt={track.title}/>

                {(isHovered || isCurrentlyPlaying) && (
                    <button
                        className="track-card__play-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClick();
                        }}
                        aria-label={isCurrentlyPlaying ? 'Зупинити' : 'Відтворити'}
                    >
                        <i className={isCurrentlyPlaying ? 'bi bi-pause-fill' : 'bi bi-play-fill'}/>
                    </button>
                )}

                <button
                    className={`track-card__like-btn ${
                        isLiked ? 'track-card__like-btn--active' : ''
                    } ${
                        !isHovered && !isLiked ? 'track-card__like-btn--hidden' : ''
                    }`}
                    onClick={handleLike}
                    disabled={isLikePending}
                    aria-label={isLiked ? 'Прибрати з улюблених' : 'Додати до улюблених'}
                >
                    <i className={isLiked ? 'bi bi-heart-fill' : 'bi bi-heart'}/>
                </button>
            </div>

            <div className="track-card__info">
                <Link
                    href={`/tracks/${track.id}`}
                    className={`track-card__title${isCurrentlyPlaying ? ' track-card__title--playing' : ''}`}
                    onClick={e => e.stopPropagation()}
                >
                    {track.title}
                </Link>

                {track.artistId ? (
                    <Link
                        href={`/artists/${track.artistId}`}
                        className="track-card__artist"
                        onClick={e => e.stopPropagation()}
                    >
                        {track.artistNames.join(' & ')}
                    </Link>
                ) : (
                    <span className="track-card__artist">
                        {track.artistNames.join(' & ')}
                    </span>
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