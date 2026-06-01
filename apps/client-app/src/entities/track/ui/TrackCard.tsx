'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuthGuard } from '@/shared/lib/useAuthGuard';
import { getImageUrl } from '@/shared/lib/getImageUrl';
import { usePlayer } from '@/entities/player/lib/usePlayer';
import { usePlayerStore } from '@/entities/player/model/playerStore';
import { useFavoriteTrack } from '@/features/track/lib/useFavoriteTrack';

export interface TrackCardData {
    id: string;
    title: string;
    artistNames: string[];
    artistId?: string;
    coverUrl?: string | null;
    durationMs?: number;
    isLiked?: boolean; // TODO: передавати з API коли зʼявиться поле
}

interface TrackCardProps {
    track: TrackCardData;
    onClick?: (id: string) => void;
}

export const TrackCard = ({ track, onClick }: TrackCardProps) => {
    const [isHovered, setIsHovered] = useState(false);

    const coverSrc = getImageUrl(track.coverUrl)
        ?? `https://picsum.photos/seed/track-${track.id}/300/300`;

    const { playQueue } = usePlayer();
    const { requireAuth } = useAuthGuard();
    const currentTrackId = usePlayerStore(s => s.currentTrack?.id);
    const playerStatus   = usePlayerStore(s => s.status);

    const isCurrentlyPlaying = currentTrackId === track.id && playerStatus === 'playing';

    const { isLiked, isPending: isLikePending, toggle: toggleLike } = useFavoriteTrack({
        initialLiked: track.isLiked ?? false,
    });

    const handleClick = () => {
        requireAuth(() => {
            onClick?.(track.id);
            playQueue([track], 0, 'Search', null);
        });
    };

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        requireAuth(() => toggleLike(track.id));
    };

    return (
        <div
            className={`track-card${isCurrentlyPlaying ? ' track-card--playing' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleClick}
        >
            {/* Обкладинка з оверлеєм при наведенні */}
            <div className="track-card__cover">
                <img src={coverSrc} alt={track.title}/>

                {/* Play кнопка зʼявляється зліва при наведенні */}
                {(isHovered || isCurrentlyPlaying) && (
                    <button
                        className="track-card__play-btn"
                        onClick={handleClick}
                        aria-label={isCurrentlyPlaying ? 'Зупинити' : 'Відтворити'}
                    >
                        <i className={isCurrentlyPlaying ? 'bi bi-pause-fill' : 'bi bi-play-fill'}/>
                    </button>
                )}

                <button
                    className={`track-card__like-btn${isLiked ? ' track-card__like-btn--active' : ''}${!isHovered && !isLiked ? ' track-card__like-btn--hidden' : ''}`}
                    onClick={handleLike}
                    disabled={isLikePending}
                    aria-label={isLiked ? 'Прибрати з улюблених' : 'Додати до улюблених'}
                >
                    <i className={isLiked ? 'bi bi-heart-fill' : 'bi bi-heart'}/>
                </button>
            </div>

            {/* Назва і артист */}
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
        </div>
    );
};