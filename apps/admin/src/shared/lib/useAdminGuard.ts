'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { useAdminSessionStore } from '@/entities/adminSession/model/store';

interface YuvironAdminJwtPayload {
    permissions?: string[];
    exp?:         number;
}

const ADMIN_LOGGED_IN_COOKIE = "admin_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";

export const useAdminGuard = (): boolean => {
    const token = useAdminSessionStore(s => s.adminAccessToken);
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);

        if (!token) {
            document.cookie = ADMIN_LOGGED_IN_COOKIE;
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
            useAdminSessionStore.getState().clearAdminSession();
            document.cookie = ADMIN_LOGGED_IN_COOKIE;
            router.replace('/login');
        }
    }, [token, router]);

    if (!isMounted) return false;
    if (!token) return false;

    try {
        const decoded = jwtDecode<YuvironAdminJwtPayload>(token);
        return decoded.permissions?.includes('AccessAdminPanel') ?? false;
    } catch {
        return false;
    }
};