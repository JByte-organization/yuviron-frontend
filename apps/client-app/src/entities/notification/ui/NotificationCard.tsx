'use client';

import React from 'react';
import Link from 'next/link';
import type { NotificationItem } from '../model/types';

interface NotificationCardProps {
    notification: NotificationItem;
    onLike?: (trackId: string) => void;
    onAddToPlaylist?: (trackId: string) => void;
    onPlay?: (trackId: string) => void;
    onRemind?: (albumId: string) => void;
    onRead?: (id: string) => void;
}

const formatTime = (dateStr: string): string => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (hours < 1) return 'Щойно';
    if (hours < 24) return `${hours} год. тому`;
    return `${days} дн. тому`;
};

const formatReleaseDate = (dateStr?: string | null): string => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
};

export const NotificationCard = ({
                                     notification,
                                     onLike,
                                     onAddToPlaylist,
                                     onPlay,
                                     onRemind,
                                     onRead,
                                 }: NotificationCardProps) => {
    const { type, isRead, createdAt, track, album } = notification;

    const item = track || album;
    if (!item) return null;

    const isUpcoming = type === 'upcoming_release';
    const isAlbum = type === 'new_release' || type === 'upcoming_release';

    const coverSrc = item.coverUrl
        ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/${item.coverUrl}`
        : `https://picsum.photos/seed/${isAlbum ? 'album' : 'track'}-${item.id}/80/80`;

    const itemHref = isAlbum ? `/albums/${item.id}` : `/tracks/${item.id}`;
    const artistHref = item.artistId ? `/artists/${item.artistId}` : '#';

    const TYPE_LABELS: Partial<Record<typeof type, string>> = {
        new_track:        'Трек',
        new_release:      'Альбом',
        upcoming_release: 'Майбутній реліз',
    };

    const typeLabel = TYPE_LABELS[type] ?? 'Трек';

    return (
        <div
            className={`notification-card${!isRead ? ' notification-card--unread' : ''}`}
            onClick={() => onRead?.(notification.id)}
        >
            {/* Індикатор непрочитаного */}
            {!isRead && <div className="notification-card__unread-dot" />}

            {/* Обкладинка */}
            <Link href={itemHref} onClick={(e) => e.stopPropagation()}>
                <div className="notification-card__cover">
                    <img src={coverSrc} alt={item.title} />
                </div>
            </Link>

            {/* Інфо */}
            <div className="notification-card__info">
                <Link
                    href={itemHref}
                    className="notification-card__title"
                    onClick={(e) => e.stopPropagation()}
                >
                    {item.title}
                </Link>
                <Link
                    href={artistHref}
                    className="notification-card__artist"
                    onClick={(e) => e.stopPropagation()}
                >
                    {item.artistName}
                </Link>
                <div className="notification-card__meta">
                    <span className="notification-card__type">{typeLabel}</span>
                    <span className="notification-card__time">{formatTime(createdAt)}</span>
                </div>

                {/* Дата майбутнього релізу */}
                {isUpcoming && album?.releaseDate && (
                    <p className="notification-card__release-date">
                        Виходить {formatReleaseDate(album.releaseDate)}
                    </p>
                )}

                {/* Кнопки дій */}
                <div className="notification-card__actions">
                    {!isUpcoming && (
                        <>
                            <button
                                className="notification-card__action-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onLike?.(item.id);
                                }}
                                aria-label="Додати до обраного"
                            >
                                <i className="bi bi-heart" />
                            </button>
                            <button
                                className="notification-card__action-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAddToPlaylist?.(item.id);
                                }}
                                aria-label="Додати до плейліста"
                            >
                                <i className="bi bi-plus" />
                            </button>
                            <button
                                className="notification-card__action-btn notification-card__action-btn--play"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPlay?.(item.id);
                                }}
                                aria-label="Відтворити"
                            >
                                <i className="bi bi-play-circle" />
                            </button>
                        </>
                    )}

                    {isUpcoming && (
                        <button
                            className="notification-card__remind-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemind?.(item.id);
                            }}
                        >
                            <i className="bi bi-bell" />
                            Нагадати
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};