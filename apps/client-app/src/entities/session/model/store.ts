// src/entities/session/model/store.ts
import { create } from 'zustand';

export interface SessionUser {
    id?: string;
    email?: string;
    role?: string;
}

interface SessionState {
    accessToken: string | null;
    user: SessionUser | null;
    setAccessToken: (token: string | null) => void;
    clearSession: () => void;
}

// Минимальный декодер payload-а JWT — без зависимости jwt-decode.
// Возвращает claims или null, если токен невалидный.
const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
    try {
        const part = token.split('.')[1];
        if (!part) return null;
        const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(json) as Record<string, unknown>;
    } catch {
        return null;
    }
};

// .NET ClaimTypes даёт claims как полные URL — резолвим частые синонимы.
const pickClaim = (payload: Record<string, unknown>, keys: string[]): string | undefined => {
    for (const key of keys) {
        const value = payload[key];
        if (typeof value === 'string' && value) return value;
    }
    return undefined;
};

const userFromToken = (token: string | null): SessionUser | null => {
    if (!token) return null;
    const payload = decodeJwtPayload(token);
    if (!payload) return null;
    return {
        id: pickClaim(payload, [
            'sub',
            'nameid',
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
        ]),
        email: pickClaim(payload, [
            'email',
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
        ]),
        role: pickClaim(payload, [
            'role',
            'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
        ]),
    };
};

export const useSessionStore = create<SessionState>((set) => ({
    accessToken: null,
    user: null,
    setAccessToken: (token) => set({ accessToken: token, user: userFromToken(token) }),
    clearSession: () => set({ accessToken: null, user: null }),
}));
