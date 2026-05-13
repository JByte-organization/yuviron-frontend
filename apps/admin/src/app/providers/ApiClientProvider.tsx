'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { configureApiClient, postApiAuthRefresh } from '@repo/api';
import { useSessionStore } from '@/entities/session/model/store';

export const ApiClientProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const setAccessToken = useSessionStore((state) => state.setAccessToken);
    const setAuth = useSessionStore((state) => state.setAuth);

    useEffect(() => {
        // 1. Налаштовуємо API клієнт
        configureApiClient({
            getToken: () => useSessionStore.getState().accessToken,
            onUnauthorized: () => {
                setAuth(null, null);
                router.replace('/login');
            },
            onTokenRefresh: (token) => setAccessToken(token),
        });

        // 2. Відновлюємо сесію при завантаженні через refresh token (HttpOnly Cookie)
        const restoreSession = async () => {
            try {
                const data = await postApiAuthRefresh();
                const token = (data as any)?.accessToken ?? (data as any)?.token;
                if (token) {
                    setAccessToken(token);
                }
            } catch {
            }
        };

        restoreSession();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <>{children}</>;
};