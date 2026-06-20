'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { configureApiClient, initCsrfToken, postApiAuthRefresh } from '@repo/api/client.ts';
import { useSessionStore } from '@/entities/session/model/store';

export const ApiClientProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();

    useEffect(() => {
        configureApiClient({
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

        useSessionStore.getState().hydrateFromHint();

        const restoreSession = async () => {
            try {
                await initCsrfToken();
                const data = await postApiAuthRefresh();
                const refreshed = data as { accessToken?: string; token?: string };
                const token = refreshed?.accessToken ?? refreshed?.token;
                if (token) {
                    useSessionStore.getState().setAccessToken(token);
                } else {
                    useSessionStore.getState().markUnauthenticated();
                }
            } catch (error) {
                useSessionStore.getState().markUnauthenticated();
                console.warn('[auth] restore session failed:', error);
            } finally {
                useSessionStore.getState().markAuthResolved();
            }
        };

        restoreSession();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <>{children}</>;
};