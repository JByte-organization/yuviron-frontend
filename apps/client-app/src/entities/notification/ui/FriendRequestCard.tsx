'use client';

import React, { useState } from 'react';
import type { NotificationItem } from '../model/types';

interface FriendRequestCardProps {
    notification: NotificationItem;
    onAddFriend?: (userId: string) => void;
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

export const FriendRequestCard = ({
                                      notification,
                                      onAddFriend,
                                      onRead,
                                  }: FriendRequestCardProps) => {
    const { isRead, createdAt, user } = notification;
    const [isFriend, setIsFriend] = useState(user?.isFriend ?? false);

    if (!user) return null;

    const avatarSrc = user.avatarUrl
        ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/${user.avatarUrl}`
        : `https://picsum.photos/seed/user-${user.id}/80/80`;

    const handleAddFriend = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsFriend(true);
        onAddFriend?.(user.id);
        // TODO: usePostApiUserFriendsUserId()
    };

    return (
        <div
            className={`friend-request-card${!isRead ? ' friend-request-card--unread' : ''}`}
            onClick={() => onRead?.(notification.id)}
        >
            {!isRead && <div className="friend-request-card__unread-dot" />}

            {/* Аватар */}
            <div className="friend-request-card__avatar">
                <img src={avatarSrc} alt={user.name} />
            </div>

            {/* Інфо */}
            <div className="friend-request-card__info">
                <p className="friend-request-card__text">
                    <span className="friend-request-card__name">{user.name}</span>
                    {' підписався на тебе'}
                </p>
                <p className="friend-request-card__time">{formatTime(createdAt)}</p>
            </div>

            {/* Кнопка */}
            <button
                className={`friend-request-card__btn${isFriend ? ' friend-request-card__btn--added' : ''}`}
                onClick={handleAddFriend}
                disabled={isFriend}
            >
                {isFriend ? (
                    <>
                        <i className="bi bi-check-lg" />
                        Вже в друзях
                    </>
                ) : (
                    <>
                        <i className="bi bi-person-plus" />
                        Додати в друзі
                    </>
                )}
            </button>
        </div>
    );
};