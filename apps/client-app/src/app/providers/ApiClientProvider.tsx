'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { configureApiClient, initCsrfToken, postApiAuthRefresh } from '@repo/api/client.ts';
import { useSessionStore } from '@/entities/session/model/store';

export const ApiClientProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();

    useEffect(() => {
        configureApiClient({
            // Same-origin проксі (Route Handler /api-proxy/[...path]) — куки
            // бекенда стають first-party до нашого домену. Прямий виклик
            // dev-api.yuviron.com з браузера ламає CSRF: XSRF-TOKEN кука
            // третьостороння, document.cookie її не бачить → refresh 400 →
            // розлогін на кожному F5 і зламані мутації (PUT settings).
            baseUrl: '/api-proxy',
            getToken: () => useSessionStore.getState().accessToken,
            onUnauthorized: () => {
                // Очищаємо токен якщо він був — але не редіректимо
                // Редірект тільки якщо користувач був авторизований
                const wasAuthenticated = !!useSessionStore.getState().accessToken;
                useSessionStore.getState().clearSession();
                if (wasAuthenticated) {
                    router.replace('/login');
                }
            },
            onTokenRefresh: (token) => useSessionStore.getState().setAccessToken(token),
        });

        const restoreSession = async () => {
            try {
                // Получаем куку XSRF-TOKEN ДО refresh — иначе бэк вернёт 400.
                await initCsrfToken();
                const data = await postApiAuthRefresh();
                const token = (data as any)?.accessToken ?? (data as any)?.token;
                if (token) {
                    useSessionStore.getState().setAccessToken(token);
                }
            } catch (error) {
                // Немає валідної refresh-куки (перший візит / сесія протухла) —
                // це нормальний шлях. Але БІЛЬШЕ не глушимо мовчки: саме тихий
                // catch ховав зламаний CSRF-refresh (розлогін на кожному F5).
                console.warn('[auth] restore session failed:', error);
            }
        };

        restoreSession();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <>{children}</>;
};