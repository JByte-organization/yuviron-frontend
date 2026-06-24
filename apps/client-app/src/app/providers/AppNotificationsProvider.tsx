'use client';

import React, { useCallback, useRef, useState } from 'react';
import { useAppNotifications } from '@/entities/notification/lib/useAppNotifications';
import { useNotificationClick } from '@/entities/notification/lib/useNotificationClick';
import { iconForNotification } from '@/entities/notification/lib/notificationView';
import type { NotificationDto } from '@/entities/notification/model/types';

export const AppNotificationsProvider = ({ children }: { children: React.ReactNode }) => {
    const [toast, setToast] = useState<NotificationDto | null>(null);
    const [visible, setVisible] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const handleClick = useNotificationClick();

    const showToast = useCallback((n: NotificationDto) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setToast(n);
        setVisible(true);
        timerRef.current = setTimeout(() => setVisible(false), 5000);
    }, []);

    useAppNotifications(showToast);

    const onToastClick = () => {
        if (!toast) return;
        setVisible(false);
        void handleClick(toast);
    };

    return (
        <>
            {children}

            <div
                className={`app-notif-toast${visible ? ' app-notif-toast--visible' : ''}`}
                role="button"
                tabIndex={0}
                onClick={onToastClick}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') onToastClick();
                }}
            >
                {toast && (
                    <>
                        <span className="app-notif-toast__icon">
                            <i className={`bi ${iconForNotification(toast)}`} />
                        </span>
                        <span className="app-notif-toast__body">
                            {toast.title && (
                                <span className="app-notif-toast__title">{toast.title}</span>
                            )}
                            {toast.body && (
                                <span className="app-notif-toast__text">{toast.body}</span>
                            )}
                        </span>
                        <button
                            type="button"
                            className="app-notif-toast__close"
                            aria-label="Закрити"
                            onClick={(e) => {
                                e.stopPropagation();
                                setVisible(false);
                            }}
                        >
                            <i className="bi bi-x" />
                        </button>
                    </>
                )}
            </div>
        </>
    );
};
