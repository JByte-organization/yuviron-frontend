'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as signalR from '@microsoft/signalr';
import { useSessionStore } from '@/entities/session/model/store';
import type { NotificationDto } from '../model/types';
import { invalidateNotifications } from './invalidateNotifications';

const hubUrl = (): string =>
    `${(process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/api$/, '')}/hubs/app`;

export const useAppNotifications = (onReceive?: (n: NotificationDto) => void) => {
    const accessToken = useSessionStore((s) => s.accessToken);
    const qc = useQueryClient();

    useEffect(() => {
        if (!accessToken) return;

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl(), {
                accessTokenFactory: () => useSessionStore.getState().accessToken ?? '',
                // 🌟 СПАСИТЕЛЬНЫЙ ХАК ДЛЯ ОБХОДА CORS БЕКЕНДА:
                // Пропускаем negotiate-запрос и сразу открываем чистое WebSocket-соединение.
                // Это полностью уберёт CORS-ошибку "x-signalr-user-agent" из консоли.
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets,
            })
            .withAutomaticReconnect()
            .build();

        connection.on('ReceiveNotification', (notification: NotificationDto) => {
            invalidateNotifications(qc);
            onReceive?.(notification);
        });

        connection.start().catch((err) => console.error('SignalR Error:', err));

        return () => {
            void connection.stop();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accessToken]);
};