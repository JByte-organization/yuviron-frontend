'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { configureApiClient } from '@repo/api';
import { useSessionStore } from '@/entities/session/model/store';

export const ApiClientProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();

    useEffect(() => {
        configureApiClient({
            getToken: () => useSessionStore.getState().accessToken,
            onUnauthorized: () => {
                useSessionStore.getState().clearSession();
                router.replace('/login');
            },
            onTokenRefresh: (token) => useSessionStore.getState().setAccessToken(token),
        });
    }, [router]);

    return <>{children}</>;
};
