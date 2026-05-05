'use client';

import React, { useState } from 'react';

interface ArtistPageHeaderProps {
    artistId: string;
    name: string;
    avatarUrl?: string | null;
    isVerified?: boolean;
    monthlyListeners?: number;
    /** TODO: підключити до плеєра */
    onPlay?: () => void;
    /** TODO: підключити до usePostApiUserFollowArtist() */
    onFollow?: () => void;
    isFollowing?: boolean;
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
                                     onPlay,
                                     onFollow,
                                     isFollowing = false,
                                 }: ArtistPageHeaderProps) => {
    const [following, setFollowing] = useState(isFollowing);

    const avatarSrc = avatarUrl
        ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/${avatarUrl}`
        : `https://picsum.photos/seed/artist-${artistId}/100/100`;

    const handleFollow = () => {
        setFollowing((v) => !v);
        onFollow?.();
        // TODO: викликати usePostApiUserFollowArtist()
    };

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
                    {/* Верифікація */}
                    {isVerified && (
                        <div className="artist-page-header__verified">
                            <i className="bi bi-patch-check-fill" />
                            <span>Верифікований виконавець</span>
                        </div>
                    )}

                    {/* Назва */}
                    <h1 className="artist-page-header__name">{name}</h1>

                    {/* Слухачі */}
                    {monthlyListeners && (
                        <p className="artist-page-header__listeners">
                            {formatListeners(monthlyListeners)}
                        </p>
                    )}
                </div>
            </div>

            {/* ─── Кнопки дій ───────────────────────────── */}
            <div className="artist-page-header__actions">
                {/* Play / Pause */}
                <button
                    className="artist-page-header__btn artist-page-header__btn--play"
                    onClick={onPlay}
                    aria-label="Play"
                >
                    <i className="bi bi-play-fill" />
                </button>

                {/* Підписатися / Відписатися */}
                <button
                    className={`artist-page-header__btn artist-page-header__btn--follow${following ? ' artist-page-header__btn--following' : ''}`}
                    onClick={handleFollow}
                >
                    {following ? (
                        <i className="bi bi-check-lg" />
                    ) : (
                        <i className="bi bi-plus-lg" />
                    )}
                </button>

                {/* Більше опцій */}
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