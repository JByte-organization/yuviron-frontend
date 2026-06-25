'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TrackPageHeaderProps {
    title: string;
    artistName: string;
    artistId: string;
    albumTitle?: string | null;
    year?: string | null;
    durationMs?: number | null;
    coverUrl?: string | null;
    trackId: string;
    onPlay?: () => void;
    onLike?: () => void;
    onAddToPlaylist?: () => void;
    onShare?: () => void; // Новий проп для копіювання посилання
    onReport?: () => void;
}

const formatDuration = (ms?: number | null): string => {
    if (!ms) return '';
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, '0')} хв`;
};

export const TrackPageHeader = ({
                                    title,
                                    artistName,
                                    artistId,
                                    albumTitle,
                                    year,
                                    durationMs,
                                    coverUrl,
                                    trackId,
                                    onPlay,
                                    onLike,
                                    onAddToPlaylist,
                                    onShare,
                                    onReport,
                                }: TrackPageHeaderProps) => {
    const router = useRouter();
    const [isLiked, setIsLiked] = useState(false);

    const coverSrc = coverUrl ?? `https://picsum.photos/seed/track-${trackId}/120/120`;

    const handleLike = () => {
        setIsLiked((v) => !v);
        onLike?.();
    };

    return (
        <div className="track-page-header">
            <div className="row align-items-end g-4 mb-4">
                <div className="col-auto">
                    <div className="track-page-header__cover">
                        <img src={coverSrc} alt={title} />
                    </div>
                </div>

                <div className="col">
                    <p className="track-page-header__type">Трек</p>
                    <h1 className="track-page-header__title">{title}</h1>
                    <div className="track-page-header__meta">
                        <span
                            className="track-page-header__artist text-white fw-semibold"
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                            onClick={() => artistId && router.push(`/artists/${artistId}`)}
                        >
                            {artistName}
                        </span>
                        {albumTitle && <span className="track-page-header__dot">•</span>}
                        {albumTitle && <span>{albumTitle}</span>}
                        {year && <span className="track-page-header__dot">•</span>}
                        {year && <span>{year}</span>}
                        {durationMs && <span className="track-page-header__dot">•</span>}
                        {durationMs && <span>{formatDuration(durationMs)}</span>}
                    </div>
                </div>
            </div>

            <div className="track-page-header__actions d-flex align-items-center gap-2">
                <button className="track-page-header__btn track-page-header__btn--play" onClick={onPlay} aria-label="Play">
                    <i className="bi bi-play-fill" />
                </button>

                <button className="track-page-header__btn track-page-header__btn--icon" onClick={onAddToPlaylist} aria-label="Додати до плейліста" title="Додати до плейліста">
                    <i className="bi bi-plus-circle" />
                </button>

                <button className={`track-page-header__btn track-page-header__btn--icon${isLiked ? ' track-page-header__btn--liked' : ''}`} onClick={handleLike} aria-label="Додати до обраного" title="Додати до обраного">
                    <i className={`bi bi-heart${isLiked ? '-fill' : ''}`} />
                </button>

                {/* Кнопка Поділитися */}
                <button
                    className="track-page-header__btn track-page-header__btn--icon"
                    onClick={onShare}
                    aria-label="Поділитися"
                    title="Поділитися посиланням"
                >
                    <i className="bi bi-share" />
                </button>

                {/* Поскаржитися */}
                <button
                    className="track-page-header__btn track-page-header__btn--icon"
                    onClick={onReport}
                    aria-label="Поскаржитися"
                    title="Поскаржитися на трек"
                >
                    <i className="bi bi-exclamation-triangle" />
                </button>
            </div>
        </div>
    );
};