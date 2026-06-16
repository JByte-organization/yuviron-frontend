'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePostApiNotificationsReadAll } from '@repo/api/client.ts';
import { NotificationCard } from '@/entities/notification/ui/NotificationCard';
import {
    GROUP_LABELS,
    GROUP_ORDER,
    NOTIFICATION_TABS,
    type NotificationTab,
} from '@/entities/notification/model/types';
import { fetchNotifications } from '@/entities/notification/lib/fetchNotifications';
import { groupNotifications } from '@/entities/notification/lib/groupNotifications';
import { invalidateNotifications } from '@/entities/notification/lib/invalidateNotifications';
import { useNotificationClick } from '@/entities/notification/lib/useNotificationClick';

export const NotificationsPage = () => {
    const [tab, setTab] = useState<NotificationTab>('all');
    const qc = useQueryClient();
    const handleClick = useNotificationClick();

    const tabCfg = NOTIFICATION_TABS.find((t) => t.key === tab) ?? NOTIFICATION_TABS[0];

    const { data, isLoading } = useQuery({
        queryKey: ['/api/notifications', tab],
        queryFn: () => fetchNotifications({ categories: tabCfg.categories }),
    });
    const items = data?.items ?? [];

    const { mutate: readAll, isPending: isReadingAll } = usePostApiNotificationsReadAll({
        mutation: { onSuccess: () => invalidateNotifications(qc) },
    });

    const unreadCount = items.filter((n) => !n.isRead).length;
    const grouped = groupNotifications(items);

    return (
        <div className="notifications-page">
            <div className="notifications-page__header">
                <div>
                    <h1 className="notifications-page__title">Повідомлення</h1>
                    <p className="notifications-page__description">
                        Нові релізи улюблених артистів, оновлення статусу профілю та системні
                        сповіщення — усе в одному місці.
                    </p>
                </div>

                {unreadCount > 0 && (
                    <button
                        className="notifications-page__read-all-btn"
                        onClick={() => readAll()}
                        disabled={isReadingAll}
                    >
                        Позначити всі як прочитані ({unreadCount})
                    </button>
                )}
            </div>

            <div className="notifications-page__filters">
                {NOTIFICATION_TABS.map((f) => (
                    <button
                        key={f.key}
                        className={`notifications-page__filter-btn${
                            tab === f.key ? ' notifications-page__filter-btn--active' : ''
                        }`}
                        onClick={() => setTab(f.key)}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            <hr className="notifications-page__divider" />

            {isLoading ? (
                <NotificationsSkeleton />
            ) : items.length === 0 ? (
                <div className="notifications-page__empty">
                    <i className="bi bi-bell-slash" />
                    <p>Повідомлень немає</p>
                </div>
            ) : (
                GROUP_ORDER.map((group) => {
                    const groupItems = grouped[group];
                    if (!groupItems.length) return null;

                    return (
                        <div key={group} className="notifications-page__group">
                            <h2 className="notifications-page__group-title">
                                {GROUP_LABELS[group]}
                            </h2>
                            <div className="notifications-page__list">
                                {groupItems.map((n) => (
                                    <NotificationCard
                                        key={n.id}
                                        notification={n}
                                        onClick={handleClick}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

const NotificationsSkeleton = () => (
    <div className="notifications-page__list">
        {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="notification-card">
                <div
                    className="skeleton skeleton--rounded"
                    style={{ width: 44, height: 44, flexShrink: 0 }}
                />
                <div className="flex-grow-1">
                    <div className="skeleton mb-2" style={{ height: 14, width: '60%' }} />
                    <div className="skeleton" style={{ height: 12, width: '40%' }} />
                </div>
            </div>
        ))}
    </div>
);
