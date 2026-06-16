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
                                 }: ArtistPageHeaderProps) => {
    const following = isFollowing;

    const avatarSrc = getImageUrl(avatarUrl)
        ?? `https://picsum.photos/seed/artist-${artistId}/200/200`;

    return (
        <div className="artist-page-header">
            <p className="artist-page-header__breadcrumb">Виконавець</p>

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

            <div className="artist-page-header__actions">
                <button
                    className="artist-page-header__btn artist-page-header__btn--play"
                    onClick={onPlay}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                    <i className={isPlaying ? 'bi bi-pause-fill' : 'bi bi-play-fill'} />
                </button>

                <button
                    className={`artist-page-header__btn artist-page-header__btn--follow${following ? ' artist-page-header__btn--following' : ''}`}
                    onClick={onFollow}
                    disabled={followPending}
                    aria-label={following ? 'Відписатися' : 'Підписатися'}
                >
                    {following ? (
                        <i className="bi bi-check-lg" />
                    ) : (
                        <i className="bi bi-plus-lg" />
                    )}
                </button>

                <button
                    className="artist-page-header__btn artist-page-header__btn--icon ms-2"
                    aria-label="Більше опцій"
                >
                    <i className="bi bi-three-dots" />
                </button>
            </div>
        </div>
    );
};