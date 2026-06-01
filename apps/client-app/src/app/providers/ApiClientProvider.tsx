'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { configureApiClient, initCsrfToken, postApiAuthRefresh } from '@repo/api/client.ts';
import { useSessionStore } from '@/entities/session/model/store';

export const ApiClientProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();

    useEffect(() => {
        configureApiClient({
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
            } catch {
            }
        };

        restoreSession();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <>{children}</>;
};