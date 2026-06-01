'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { configureApiClient } from '@repo/api/admin.ts';
import { useAdminSessionStore } from '@/entities/adminSession/model/store';

// ══════════════════════════════════════════════════════════
// ApiClientProvider (Admin)
//
// Відповідає за:
// 1. Налаштування API клієнта з токеном адміна
// 2. Автоматичне очищення сесії при 401 (токен протух після 12 годин)
// 3. Ротацію токена через refresh (поки адмін активний)
// ══════════════════════════════════════════════════════════
export const ApiClientProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();

    useEffect(() => {
        configureApiClient({
            getToken: () => useAdminSessionStore.getState().adminAccessToken,

            onUnauthorized: () => {
                // Сесія протухла (12-годинний TTL) або токен невалідний
                useAdminSessionStore.getState().clearAdminSession();
                router.replace('/login');
            },

            onTokenRefresh: token => {
                // Бекенд видав новий access token через refresh cookie
                useAdminSessionStore.getState().setAdminAccessToken(token);
            },
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <>{children}</>;
};