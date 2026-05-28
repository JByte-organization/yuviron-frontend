'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { useAdminSessionStore } from '@/entities/adminSession/model/store';

interface YuvironAdminJwtPayload {
    permissions?: string[];
    exp?:         number;
}

// ══════════════════════════════════════════════════════════
// useAdminGuard
// Перевіряє наявність токена і права AccessAdminPanel.
// Використовується в layout адмінки.
// ══════════════════════════════════════════════════════════
export const useAdminGuard = (): boolean => {
    const token  = useAdminSessionStore(s => s.adminAccessToken);
    const router = useRouter();

    useEffect(() => {
        if (!token) {
            router.replace('/login');
            return;
        }

        try {
            const decoded = jwtDecode<YuvironAdminJwtPayload>(token);
            const hasAccess = decoded.permissions?.includes('AccessAdminPanel') ?? false;

            if (!hasAccess) {
                router.replace('/403');
            }
        } catch {
            // Токен невалідний
            useAdminSessionStore.getState().clearAdminSession();
            router.replace('/login');
        }
    }, [token, router]);

    if (!token) return false;

    try {
        const decoded = jwtDecode<YuvironAdminJwtPayload>(token);
        return decoded.permissions?.includes('AccessAdminPanel') ?? false;
    } catch {
        return false;
    }
};