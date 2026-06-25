'use client';

import React from 'react';
import { getImageUrl } from '@/shared/lib/getImageUrl';

interface ArtistPageHeaderProps {
    artistId: string;
    name: string;
    avatarUrl?: string | null;
    isVerified?: boolean;
    monthlyListeners?: number;
    isPlaying?: boolean;
    onPlay?: () => void;
    onFollow?: () => void;
    isFollowing?: boolean;
    followPending?: boolean;
    onReport?: () => void;
}

const formatListeners = (count?: number): string => {
    if (!count) return '';
    return count.toLocaleString('uk-UA') + ' слухачів за місяць';
};

export const ArtistPageHeader = ({
                                     artistId,
                                     name,
                                     avatarUrl,
                                     isVerified = false,
                                     monthlyListeners,
                                     isPlaying = false,
                                     onPlay,
                                     onFollow,
                                     isFollowing = false,
                                     followPending = false,
                                     onReport,
                                 }: ArtistPageHeaderProps) => {

    const avatarSrc = getImageUrl(avatarUrl)
        ?? `https://picsum.photos/seed/artist-${artistId}/200/200`;

    return (
        <div className="artist-page-header">
            {/* ─── Breadcrumb ───────────────────────────── */}
            <p className="artist-page-header__breadcrumb">Виконавець</p>

            {/* ─── Аватар + інфо ────────────────────────── */}
            <div className="row align-items-end g-4 mb-4">
                <div className="col-auto">
                    <div className="artist-page-header__avatar">
                        <img src={avatarSrc} alt={name} />
                    </div>
                </div>

                <div className="col">
                    {isVerified && (
                        <div className="artist-page-header__verified">
                            <i className="bi bi-patch-check-fill" />
                            <span>Верифікований виконавець</span>
                        </div>
                    )}

                    <h1 className="artist-page-header__name">{name}</h1>

                    {monthlyListeners && (
                        <p className="artist-page-header__listeners">
                            {formatListeners(monthlyListeners)}
                        </p>
                    )}
                </div>
            </div>

            {/* ─── Оновлений блок дій: чистий лінійний ряд ─── */}
            <div className="artist-page-header__actions d-flex align-items-center gap-2">
                {/* Кнопка відтворення */}
                <button
                    className="artist-page-header__btn artist-page-header__btn--play"
                    onClick={onPlay}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                    <i className={isPlaying ? 'bi bi-pause-fill' : 'bi bi-play-fill'} />
                </button>

                {/* Уніфікована текстова кнопка Підписатися / Відписатися */}
                <button
                    type="button"
                    className={`playlist-page-header__subscribe-btn${isFollowing ? ' playlist-page-header__subscribe-btn--active' : ''}`}
                    onClick={onFollow}
                    disabled={followPending}
                    style={{ height: '42px', padding: '0 24px' }} // Выравниваем высоту под кнопку Play
                >
                    {isFollowing ? 'Відписатися' : 'Підписатися'}
                </button>

                {/* Кнопка скарги замість трьох точок */}
                <button
                    type="button"
                    className="playlist-page-header__btn playlist-page-header__btn--icon"
                    onClick={onReport}
                    aria-label="Поскаржитися"
                    title="Поскаржитися на виконавця"
                >
                    <i className="bi bi-exclamation-triangle" />
                </button>
            </div>
        </div>
    );
};