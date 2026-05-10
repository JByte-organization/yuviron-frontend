'use client';

import React, { useState } from 'react';
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
    onShare?: () => void;
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
                                   onShare,
                               }: UserPageHeaderProps) => {
    const [following, setFollowing] = useState(isFollowing);

    const avatarSrc = avatarUrl
        ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/${avatarUrl}`
        : `https://picsum.photos/seed/vibrant-${userId}/200/200`;

    // Витягуємо домінуючий колір з аватарки
    const dominantColor = useAvatarColor(avatarSrc);

    const handleFollow = () => {
        setFollowing((v) => !v);
        onFollow?.();
        // TODO: usePostApiUsersIdFollow()
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
                {/* Аватарка */}
                <div className="user-page-header__avatar">
                    <img src={avatarSrc} alt={name} />
                </div>

                {/* Інфо */}
                <div className="user-page-header__info">
                    <p className="user-page-header__type">Профіль</p>
                    <h1 className="user-page-header__name">{name}</h1>

                    {/* Статистика — клікабельна */}
                    <div className="user-page-header__stats">
                        <span className="user-page-header__stat">
                            {playlistsCount} відкритих плейлістів
                        </span>
                        <span className="user-page-header__dot">•</span>
                        <button
                            className="user-page-header__stat-link"
                            onClick={() => document.getElementById('followers')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            {formatCount(followersCount)} підписників
                        </button>
                        <span className="user-page-header__dot">•</span>
                        <button
                            className="user-page-header__stat-link"
                            onClick={() => document.getElementById('following')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            {formatCount(followingCount)} підписок
                        </button>
                    </div>
                </div>
            </div>

            {/* Кнопки дій */}
            <div className="user-page-header__actions">
                {isOwner ? (
                    <>
                        {/* Налаштування */}
                        <Link
                            href="/settings"
                            className="user-page-header__action-btn"
                            aria-label="Налаштування"
                            title="Налаштування"
                        >
                            <i className="bi bi-gear" />
                        </Link>

                        {/* Редагувати профіль */}
                        <button
                            className="user-page-header__action-btn"
                            onClick={onEdit}
                            aria-label="Редагувати профіль"
                            title="Редагувати профіль"
                        >
                            <i className="bi bi-pencil" />
                        </button>

                        {/* Поділитися */}
                        <button
                            className="user-page-header__action-btn"
                            onClick={onShare}
                            aria-label="Поділитися профілем"
                            title="Поділитися профілем"
                        >
                            <i className="bi bi-share" />
                        </button>
                    </>
                ) : (
                    <>
                        {/* Підписатися */}
                        <button
                            className={`user-page-header__follow-btn${following ? ' user-page-header__follow-btn--active' : ''}`}
                            onClick={handleFollow}
                        >
                            {following ? 'Відписатися' : 'Підписатися'}
                        </button>

                        {/* Поділитися */}
                        <button
                            className="user-page-header__action-btn"
                            onClick={onShare}
                            aria-label="Поділитися"
                        >
                            <i className="bi bi-share" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};