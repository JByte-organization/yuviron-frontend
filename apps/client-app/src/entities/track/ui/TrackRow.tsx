'use client';

import React, { useState } from 'react';
import Link from 'next/link';

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
}

interface TrackRowProps {
    track: TrackRowData;
    /** TODO: підключити до глобального плеєра */
    isPlaying?: boolean;
    /** Викликається при кліку на рядок — програє трек */
    onClick?: (id: string) => void;
    /** Викликається при кліку на серце */
    onLike?: (id: string) => void;
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

    return date.toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

export const TrackRow = ({
                             track,
                             isPlaying = false,
                             onClick,
                             onLike,
                         }: TrackRowProps) => {
    const [isHovered, setIsHovered] = useState(false);

    const coverSrc = track.coverUrl
        ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/${track.coverUrl}`
        : `https://picsum.photos/seed/track-${track.id}/40/40`;

    return (
        <div
            className={`track-row${isPlaying ? ' track-row--playing' : ''}${isHovered ? ' track-row--hovered' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onClick?.(track.id)} // клік на рядок = програти
        >
            {/* ─── Номер / анімація / play іконка ──────────── */}
            <div className="track-row__index">
                {isPlaying ? (
                    // TODO: замінити на CSS анімацію equalizer
                    <i className="bi bi-volume-up-fill track-row__playing-icon" />
                ) : isHovered ? (
                    <i className="bi bi-play-fill" />
                ) : (
                    <span>{track.index}</span>
                )}
            </div>

            {/* ─── Обкладинка + назва + артист ─────────────── */}
            <div className="track-row__info">
                <div className="track-row__cover">
                    <img src={coverSrc} alt={track.title} />
                </div>
                <div className="track-row__meta">
                    {/* Назва — веде на сторінку треку */}
                    <Link
                        href={`/tracks/${track.id}`}
                        className={`track-row__title${isPlaying ? ' track-row__title--playing' : ''}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {track.title}
                    </Link>

                    {/* Артист — веде на сторінку артиста */}
                    {track.artistId ? (
                        <Link
                            href={`/artists/${track.artistId}`}
                            className="track-row__artist"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {track.artistNames.join(', ')}
                        </Link>
                    ) : (
                        <span className="track-row__artist">
                            {track.artistNames.join(', ')}
                        </span>
                    )}
                </div>
            </div>

            {/* ─── Альбом — веде на сторінку альбому ──────── */}
            <div className="track-row__album d-none d-md-block">
                {track.albumId ? (
                    <Link
                        href={`/albums/${track.albumId}`}
                        className="track-row__album-link"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {track.albumTitle ?? '—'}
                    </Link>
                ) : (
                    <span>{track.albumTitle ?? '—'}</span>
                )}
            </div>

            {/* ─── Дата додавання ───────────────────────────── */}
            <div className="track-row__date d-none d-lg-block">
                {formatDate(track.addedAt)}
            </div>

            {/* ─── Дії + тривалість ─────────────────────────── */}
            <div className="track-row__actions">
                <button
                    className="track-row__like-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        onLike?.(track.id);
                    }}
                    aria-label="Like"
                >
                    <i className="bi bi-heart" />
                </button>
                <span className="track-row__duration">
                    {formatDuration(track.durationMs)}
                </span>
            </div>
        </div>
    );
};