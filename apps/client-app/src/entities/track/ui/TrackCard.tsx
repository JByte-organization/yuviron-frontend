'use client';

import React from 'react';
import Link from 'next/link';
import {useAuthGuard} from '@/shared/lib/useAuthGuard';
import { getImageUrl } from '@/shared/lib/getImageUrl';

export interface TrackCardData {
    id: string;
    title: string;
    artistNames: string[];
    artistId?: string;
    coverUrl?: string | null;
    durationMs?: number;
}

interface TrackCardProps {
    track: TrackCardData;
    onClick?: (id: string) => void;
}

export const TrackCard = ({ track, onClick }: TrackCardProps) => {

    const coverSrc = getImageUrl(track.coverUrl)
        ?? `https://picsum.photos/seed/track-${track.id}/300/300`;



    const { requireAuth } = useAuthGuard();

    const handleClick = () => {
        requireAuth(() => onClick?.(track.id));
    };

    return (
        <div
            className="track-card"
            // onClick={() => onClick?.(track.id)} // клік на картку = програти
            onClick={handleClick}

        >
            <div className="track-card__cover">
                <img src={coverSrc} alt={track.title} />
            </div>
            <div className="track-card__info">

                {/* Назва — веде на сторінку треку */}
                <Link
                    href={`/tracks/${track.id}`}
                    className="track-card__title"
                    onClick={(e) => e.stopPropagation()}
                >
                    {track.title}
                </Link>

                {/* Артист — веде на сторінку артиста */}
                {track.artistId ? (
                    <Link
                        href={`/artists/${track.artistId}`}
                        className="track-card__artist"
                        onClick={(e) => e.stopPropagation()}
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