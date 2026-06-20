'use client';

import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { postApiAuthRefresh, usePostApiNotificationsIdRead } from '@repo/api/client.ts';
import { useSessionStore } from '@/entities/session/model/store';
import type { NotificationDto } from '../model/types';
import { invalidateNotifications } from './invalidateNotifications';

const routeFor = (n: NotificationDto): string | null => {
    if (!n.entityId) return null;
    switch (n.entityType) {
        case 'Track':
            return `/tracks/${n.entityId}`;
        case 'Album':
            return `/albums/${n.entityId}`;
        case 'Artist':
            return `/artists/${n.entityId}`;
        default:
            return null;
    }
};

export const useNotificationClick = () => {
    const router = useRouter();
    const qc = useQueryClient();
    const setAccessToken = useSessionStore((s) => s.setAccessToken);
    const { mutateAsync: markRead } = usePostApiNotificationsIdRead();

    return async (n: NotificationDto) => {
        if (n.id && !n.isRead) {
            try {
                await markRead({ id: n.id });
                invalidateNotifications(qc);
            } catch {
            }
        }

        if (n.type === 'artist_claim_approved') {
            try {
                const refreshed = await postApiAuthRefresh();
                const token =
                    (refreshed as { accessToken?: string; token?: string })?.accessToken ??
                    (refreshed as { token?: string })?.token;
                if (token) setAccessToken(token);
            } catch {
            }
            router.push('/artist-dashboard');
            return;
        }

        const href = routeFor(n);
        if (href) router.push(href);
    };
};
