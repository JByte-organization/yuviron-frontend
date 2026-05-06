'use client';

import React, { useState } from 'react';
import { NotificationCard } from '@/entities/notification/ui/NotificationCard';
import { FriendRequestCard } from '@/entities/notification/ui/FriendRequestCard';
import { MOCK_NOTIFICATIONS } from '@/entities/notification/model/mockData';
import {
    type NotificationFilter,
    type NotificationGroup,
    type NotificationItem,
    GROUP_LABELS,
} from '@/entities/notification/model/types';

/**
 * Сторінка: Повідомлення
 *
 * Підключення даних:
 * 1. const { data, isLoading } = useGetApiNotifications({ filter, page, pageSize });
 * 2. Замінити MOCK_NOTIFICATIONS на data?.items
 * 3. Для "позначити всі" — usePostApiNotificationsReadAll()
 * 4. Для одного — usePostApiNotificationsIdRead(id)
 */
export const NotificationsPage = () => {
    const [filter, setFilter] = useState<NotificationFilter>('all');

    // TODO: замінити на хук — useGetApiNotifications({ filter })
    const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

    const isLoading = false;

    // ─── Фільтрація ───────────────────────────────────────
    const filtered = notifications.filter((n) => {
        if (filter === 'tracks') return n.type === 'new_track';
        if (filter === 'other')  return n.type !== 'new_track';
        return true;
    });

    // ─── Групування ───────────────────────────────────────
    const grouped = filtered.reduce<Record<NotificationGroup, NotificationItem[]>>(
        (acc, n) => {
            if (!acc[n.group]) acc[n.group] = [];
            acc[n.group].push(n);
            return acc;
        },
        {} as Record<NotificationGroup, NotificationItem[]>
    );

    const groupOrder: NotificationGroup[] = ['today', 'this_week', 'this_month', 'earlier'];
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    // ─── Handlers ─────────────────────────────────────────
    const handleRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => n.id === id ? { ...n, isRead: true } : n)
        );
        // TODO: usePostApiNotificationsIdRead(id)
    };

    const handleReadAll = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        // TODO: usePostApiNotificationsReadAll()
    };

    const FILTERS: { key: NotificationFilter; label: string }[] = [
        { key: 'all',    label: 'Всі' },
        { key: 'tracks', label: 'Треки' },
        { key: 'other',  label: 'Інше' },
    ];

    return (
        <div className="notifications-page">

            {/* ─── Заголовок ────────────────────────────── */}
            <div className="notifications-page__header">
                <div>
                    <h1 className="notifications-page__title">Повідомлення</h1>
                    <p className="notifications-page__description">
                        Функція повідомлень робить взаємодію з музикою ще зручнішою та цікавішою.
                        Нові релізи улюблених артистів, подкастів, оновлення плейлістів.
                    </p>
                </div>

                {/* Позначити всі як прочитані */}
                {unreadCount > 0 && (
                    <button
                        className="notifications-page__read-all-btn"
                        onClick={handleReadAll}
                    >
                        Позначити всі як прочитані ({unreadCount})
                    </button>
                )}
            </div>

            {/* ─── Фільтр-таби ──────────────────────────── */}
            <div className="notifications-page__filters">
                {FILTERS.map((f) => (
                    <button
                        key={f.key}
                        className={`notifications-page__filter-btn${filter === f.key ? ' notifications-page__filter-btn--active' : ''}`}
                        onClick={() => setFilter(f.key)}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            <hr className="notifications-page__divider" />

            {/* ─── Контент ──────────────────────────────── */}
            {isLoading ? (
                <NotificationsSkeleton />
            ) : filtered.length === 0 ? (
                <div className="notifications-page__empty">
                    <i className="bi bi-bell-slash" />
                    <p>Повідомлень немає</p>
                </div>
            ) : (
                groupOrder.map((group) => {
                    const items = grouped[group];
                    if (!items?.length) return null;

                    // Розділяємо на друзів та медіа
                    const friendItems = items.filter((n) => n.type === 'friend_request');
                    const mediaItems  = items.filter((n) => n.type !== 'friend_request');

                    return (
                        <div key={group} className="notifications-page__group">
                            <h2 className="notifications-page__group-title">
                                {GROUP_LABELS[group]}
                            </h2>

                            {/* Медіа картки — 2 колонки */}
                            {mediaItems.length > 0 && (
                                <div className="row g-3 mb-3">
                                    {mediaItems.map((n) => (
                                        <div key={n.id} className="col-12 col-md-6">
                                            <NotificationCard
                                                notification={n}
                                                onRead={handleRead}
                                                onPlay={(id) => console.log('play', id)}       // TODO: плеєр
                                                onLike={(id) => console.log('like', id)}       // TODO: хук
                                                onAddToPlaylist={(id) => console.log('playlist', id)} // TODO: модалка
                                                onRemind={(id) => console.log('remind', id)}   // TODO: хук
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Запити в друзі — повна ширина */}
                            {friendItems.map((n) => (
                                <div key={n.id} className="mb-2">
                                    <FriendRequestCard
                                        notification={n}
                                        onRead={handleRead}
                                        onAddFriend={(id) => console.log('add friend', id)} // TODO: хук
                                    />
                                </div>
                            ))}
                        </div>
                    );
                })
            )}
        </div>
    );
};

const NotificationsSkeleton = () => (
    <div className="row g-3">
        {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="col-12 col-md-6">
                <div className="notification-card">
                    <div className="skeleton skeleton--rounded" style={{ width: 80, height: 80, flexShrink: 0 }} />
                    <div className="flex-grow-1">
                        <div className="skeleton mb-2" style={{ height: 14, width: '70%' }} />
                        <div className="skeleton mb-2" style={{ height: 12, width: '50%' }} />
                        <div className="skeleton" style={{ height: 11, width: '40%' }} />
                    </div>
                </div>
            </div>
        ))}
    </div>
);