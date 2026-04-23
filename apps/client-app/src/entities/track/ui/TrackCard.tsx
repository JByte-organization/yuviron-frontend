import React from 'react';

export interface TrackCardData {
    id: string;
    title: string;
    artistNames: string[];
    coverUrl?: string | null;
    durationMs?: number;
}

interface TrackCardProps {
    track: TrackCardData;
    onClick?: (id: string) => void;
}

/**
 * Карточка треку.
 * Розмір контролюється Bootstrap колонками в батьківському компоненті.
 *
 * Підключення даних:
 * coverUrl — ключ з БД, формат: storage_url/coverUrl
 */
export const TrackCard = ({ track, onClick }: TrackCardProps) => {
    const coverSrc = track.coverUrl
        ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/${track.coverUrl}`
        : `https://picsum.photos/seed/track-${track.id}/300/300`;

    return (
        <div className="track-card" onClick={() => onClick?.(track.id)}>
            <div className="track-card__cover">
                <img src={coverSrc} alt={track.title} />
            </div>
            <div className="track-card__info">
                <p className="track-card__title">{track.title}</p>
                <p className="track-card__artist">{track.artistNames.join(' & ')}</p>
            </div>
        </div>
    );
};