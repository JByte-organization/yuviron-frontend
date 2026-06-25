'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAvatarColor } from '@/shared/lib/useAvatarColor';

interface UserPageHeaderProps {
    userId: string;
    name: string;
    avatarUrl?: string | null;
    playlistsCount: number;
    followersCount: number;
    followingCount: number;
    isOwner: boolean;
    isFollowing?: boolean;
    onEdit?: () => void;
    onFollow?: () => void;
    onReport?: () => void; // Тригер модалки скарги залишається
}

const formatCount = (n: number): string => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + ' млн';
    if (n >= 1000)    return (n / 1000).toFixed(1) + ' тис';
    return String(n);
};

export const UserPageHeader = ({
                                   userId,
                                   name,
                                   avatarUrl,
                                   playlistsCount,
                                   followersCount,
                                   followingCount,
                                   isOwner,
                                   isFollowing = false,
                                   onEdit,
                                   onFollow,
                                   onReport,
                               }: UserPageHeaderProps) => {
    const [following, setFollowing] = useState(isFollowing);

    useEffect(() => {
        requestAnimationFrame(() => {
            setFollowing(isFollowing);
        });
    }, [isFollowing, userId]);

    const hasCustomAvatar = useMemo(() => !!avatarUrl, [avatarUrl]);

    const avatarSrc = useMemo(() => {
        if (!hasCustomAvatar) return '/images/avatar/default-avatar.png';
        if (avatarUrl && avatarUrl.startsWith('http')) {
            return `/api/image-proxy?url=${encodeURIComponent(avatarUrl)}`;
        }
        return avatarUrl!;
    }, [hasCustomAvatar, avatarUrl]);

    const detectedColor = useAvatarColor(hasCustomAvatar ? avatarSrc : '');

    const dominantColor = useMemo(() => {
        if (!hasCustomAvatar) return '#282828';
        return detectedColor || '#404040';
    }, [hasCustomAvatar, detectedColor]);

    const handleFollowClick = () => {
        setFollowing((v) => !v);
        onFollow?.();
    };

    return (
        <div className="user-page-header">
            {/* Градієнтний фон */}
            <div
                className="user-page-header__gradient"
                style={{
                    background: `linear-gradient(180deg, ${dominantColor} 0%, transparent 100%)`,
                }}
            />

            <div className="user-page-header__content">
                <div className="user-page-header__avatar">
                    <img src={avatarSrc} alt={name} />
                </div>

                <div className="user-page-header__info">
                    <p className="user-page-header__type">Профіль</p>
                    <h1 className="user-page-header__name">{name}</h1>

                    <div className="user-page-header__stats">
                        <span className="user-page-header__stat">{playlistsCount} плейлістів</span>
                        <span className="user-page-header__dot">•</span>
                        <button
                            className="user-page-header__stat-link"
                            onClick={() => document.getElementById('followers')?.scrollIntoView({behavior: 'smooth'})}
                        >
                            {formatCount(followersCount)} підписників
                        </button>
                        <span className="user-page-header__dot">•</span>
                        <button
                            className="user-page-header__stat-link"
                            onClick={() => document.getElementById('following')?.scrollIntoView({behavior: 'smooth'})}
                        >
                            {formatCount(followingCount)} підписок
                        </button>
                    </div>
                </div>
            </div>

            {/* БЛОК ДІЙ: ЧИСТИЙ РЯД КНОПОК БЕЗ ДРОПДАУНІВ */}
            <div className="user-page-header__actions d-flex align-items-center gap-2">
                {isOwner ? (
                    <>
                        <Link
                            href="/settings"
                            className="user-page-header__action-btn"
                            aria-label="Налаштування"
                            title="Налаштування"
                        >
                            <i className="bi bi-gear" />
                        </Link>

                        <button
                            type="button"
                            className="user-page-header__action-btn"
                            onClick={onEdit}
                            aria-label="Редагувати профіль"
                            title="Редагувати профіль"
                        >
                            <i className="bi bi-pencil" />
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            type="button"
                            className={`user-page-header__follow-btn${following ? ' user-page-header__follow-btn--active' : ''}`}
                            onClick={handleFollowClick}
                        >
                            {following ? 'Відписатися' : 'Підписатися'}
                        </button>

                        <button
                            type="button"
                            className="user-page-header__action-btn"
                            onClick={onReport}
                            aria-label="Поскаржитися"
                            title="Поскаржитися"
                        >
                            <i className="bi bi-exclamation-triangle" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};