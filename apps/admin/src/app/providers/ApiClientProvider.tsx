'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { configureApiClient } from '@repo/api';
import { useSessionStore } from '@/entities/session/model/store';

export const ApiClientProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const setAccessToken = useSessionStore((state) => state.setAccessToken);
    const setAuth = useSessionStore((state) => state.setAuth);

    useEffect(() => {
        configureApiClient({
            getToken: () => useSessionStore.getState().accessToken,
            onUnauthorized: () => {
                setAuth(null, null);
                router.replace('/login');
            },
            onTokenRefresh: (token) => setAccessToken(token),
        });
    }, [router, setAccessToken, setAuth]);

    return <>{children}</>;
};