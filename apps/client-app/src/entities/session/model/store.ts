import { create } from 'zustand';
import { clearStoredArtistId } from '@/entities/artist/model/artistIdStorage';

export interface SessionUser {
    id?: string;
    email?: string;
    role?: string;
    artistId?: string;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface SessionState {
    accessToken: string | null;
    user: SessionUser | null;
    status: AuthStatus;
    authResolved: boolean;
    setAccessToken: (token: string | null) => void;
    markAuthResolved: () => void;
    clearSession: () => void;
    markUnauthenticated: () => void;
    hydrateFromHint: () => void;
}

const SESSION_HINT_KEY = 'yuviron.hasSession';

const readSessionHint = (): boolean => {
    if (typeof window === 'undefined') return false;
    try {
        return window.localStorage.getItem(SESSION_HINT_KEY) === '1';
    } catch {
        return false;
    }
};

const writeSessionHint = (hasSession: boolean): void => {
    if (typeof window === 'undefined') return;
    try {
        if (hasSession) window.localStorage.setItem(SESSION_HINT_KEY, '1');
        else window.localStorage.removeItem(SESSION_HINT_KEY);
    } catch {
    }
};

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
        artistId: pickClaim(payload, [
            'artistId',
            'artist_id',
            'ArtistId',
            'artistProfileId',
            'artist_profile_id',
        ]),
    };
};

export const useSessionStore = create<SessionState>((set, get) => ({
    accessToken: null,
    user: null,
    status: 'loading',
    authResolved: false,
    setAccessToken: (token) => {
        writeSessionHint(!!token);
        set({
            accessToken: token,
            user: userFromToken(token),
            status: token ? 'authenticated' : 'unauthenticated',
        });
    },
    markAuthResolved: () => set({ authResolved: true }),
    clearSession: () => {
        clearStoredArtistId(get().user?.id);
        writeSessionHint(false);
        set({ accessToken: null, user: null, status: 'unauthenticated' });
    },
    markUnauthenticated: () => {
        writeSessionHint(false);
        set({ status: 'unauthenticated' });
    },
    hydrateFromHint: () =>
        set((s) =>
            s.accessToken || !readSessionHint()
                ? s
                : { status: 'authenticated' },
        ),
}));

export const selectIsAuthenticated = (s: SessionState): boolean =>
    s.status === 'authenticated';
