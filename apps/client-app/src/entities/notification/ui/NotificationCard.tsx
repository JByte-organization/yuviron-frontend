'use client';

import React from 'react';
import type { NotificationDto } from '../model/types';
import { formatRelativeTime, iconForNotification } from '../lib/notificationView';

interface NotificationCardProps {
    notification: NotificationDto;
    onClick: (notification: NotificationDto) => void;
}

export const NotificationCard = ({ notification, onClick }: NotificationCardProps) => {
    const { title, body, isRead, createdAt } = notification;

    return (
        <button
            type="button"
            className={`notification-card${!isRead ? ' notification-card--unread' : ''}`}
            onClick={() => onClick(notification)}
        >
            {!isRead && <span className="notification-card__unread-dot" />}

            <span className="notification-card__icon">
                <i className={`bi ${iconForNotification(notification)}`} />
            </span>

            <span className="notification-card__info">
                {title && <span className="notification-card__title">{title}</span>}
                {body && <span className="notification-card__body">{body}</span>}
                <span className="notification-card__time">{formatRelativeTime(createdAt)}</span>
            </span>

            <i className="bi bi-chevron-right notification-card__arrow" />
        </button>
    );
};
