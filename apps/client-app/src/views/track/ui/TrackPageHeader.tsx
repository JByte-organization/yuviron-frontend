'use client';

import React, { useState } from 'react';

interface TrackPageHeaderProps {
    title: string;
    artistName: string;
    albumTitle?: string | null;
    year?: string | null;
    durationMs?: number | null;
    coverUrl?: string | null;
    trackId: string;
    /** TODO: підключити до плеєра */
    onPlay?: () => void;
    /** TODO: підключити до хука usePostApiUserFavorites() */
    onLike?: () => void;
    /** TODO: підключити до модалки вибору плейліста */
    onAddToPlaylist?: () => void;
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
                                    albumTitle,
                                    year,
                                    durationMs,
                                    coverUrl,
                                    trackId,
                                    onPlay,
                                    onLike,
                                    onAddToPlaylist,
                                }: TrackPageHeaderProps) => {
    const [isLiked, setIsLiked] = useState(false);

    const coverSrc = coverUrl
        ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/${coverUrl}`
        : `https://picsum.photos/seed/track-${trackId}/120/120`;

    const handleLike = () => {
        setIsLiked((v) => !v);
        onLike?.();
        // TODO: викликати usePostApiUserFavorites()
    };

    return (
        <div className="track-page-header">
            {/* ─── Верхній блок: обкладинка + інфо ─── */}
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
                        <span className="track-page-header__artist">{artistName}</span>
                        {albumTitle && <span className="track-page-header__dot">•</span>}
                        {albumTitle && <span>{albumTitle}</span>}
                        {year && <span className="track-page-header__dot">•</span>}
                        {year && <span>{year}</span>}
                        {durationMs && <span className="track-page-header__dot">•</span>}
                        {durationMs && <span>{formatDuration(durationMs)}</span>}
                    </div>
                </div>
            </div>

            {/* ─── Кнопки дій ─── */}
            <div className="track-page-header__actions">
                {/* Play */}
                <button
                    className="track-page-header__btn track-page-header__btn--play"
                    onClick={onPlay}
                    aria-label="Play"
                >
                    <i className="bi bi-play-fill" />
                </button>

                {/* Додати до плейліста */}
                <button
                    className="track-page-header__btn track-page-header__btn--icon"
                    onClick={onAddToPlaylist}
                    aria-label="Додати до плейліста"
                    title="Додати до плейліста"
                >
                    <i className="bi bi-plus-circle" />
                </button>

                {/* Додати до обраного */}
                <button
                    className={`track-page-header__btn track-page-header__btn--icon${isLiked ? ' track-page-header__btn--liked' : ''}`}
                    onClick={handleLike}
                    aria-label="Додати до обраного"
                    title="Додати до обраного"
                >
                    <i className={`bi bi-heart${isLiked ? '-fill' : ''}`} />
                </button>

                {/* Більше опцій */}
                <button
                    className="track-page-header__btn track-page-header__btn--icon ms-2"
                    aria-label="Більше опцій"
                >
                    <i className="bi bi-three-dots" />
                </button>
            </div>
        </div>
    );
};