'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { configureApiClient, initCsrfToken } from '@repo/api/admin.ts';
import { useAdminSessionStore } from '@/entities/adminSession/model/store';

export const ApiClientProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();

    useEffect(() => {
        configureApiClient({
            getToken: () => useAdminSessionStore.getState().adminAccessToken,

            onUnauthorized: () => {
                useAdminSessionStore.getState().clearAdminSession();
                router.replace('/login');
            },

            onTokenRefresh: token => {
                useAdminSessionStore.getState().setAdminAccessToken(token);
            },
        });

        initCsrfToken();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <>{children}</>;
};