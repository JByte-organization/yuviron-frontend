'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as signalR from '@microsoft/signalr';
import { useSessionStore } from '@/entities/session/model/store';
import type { NotificationDto } from '../model/types';
import { invalidateNotifications } from './invalidateNotifications';

// Хаб живёт на корне хоста: NEXT_PUBLIC_API_URL = "https://host/api" → "https://host".
const hubUrl = (): string =>
    `${(process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/api$/, '')}/hubs/app`;

// Real-time пуши уведомлений. Соединение открывается один раз для залогиненного
// юзера и переустанавливается при смене токена. На каждый ReceiveNotification
// инвалидируем список+счётчик и отдаём DTO наверх (для тоста).
export const useAppNotifications = (onReceive?: (n: NotificationDto) => void) => {
    const accessToken = useSessionStore((s) => s.accessToken);
    const qc = useQueryClient();

    useEffect(() => {
        if (!accessToken) return;

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl(), {
                // Токен берём из стора на момент подключения/реконнекта.
                accessTokenFactory: () => useSessionStore.getState().accessToken ?? '',
            })
            .withAutomaticReconnect()
            .build();

        connection.on('ReceiveNotification', (notification: NotificationDto) => {
            invalidateNotifications(qc);
            onReceive?.(notification);
        });

        connection.start().catch((err) => console.error('SignalR Error:', err));

        // Критично: останавливаем соединение при размонтировании / смене токена,
        // иначе пуши задублируются после reconnect.
        return () => {
            void connection.stop();
        };
        // qc/onReceive стабильны для нашего использования — не пересоздаём соединение.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accessToken]);
};
