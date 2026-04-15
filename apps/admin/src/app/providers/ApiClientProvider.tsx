'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { configureApiClient } from '@repo/api';
import { useSessionStore } from '@/entities/session/model/store'; // стор admin-приложения

export const ApiClientProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();

    useEffect(() => {
        configureApiClient({
            getToken: () => useSessionStore.getState().accessToken,
            onUnauthorized: () => router.replace('/login'),
            onTokenRefresh: (token) => useSessionStore.getState().setAccessToken(token),
        });
    }, []);

    return <>{children}</>;
};