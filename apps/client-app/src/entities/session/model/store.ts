// src/entities/session/model/store.ts
import { create } from 'zustand';
import { clearStoredArtistId } from '@/entities/artist/model/artistIdStorage';

export interface SessionUser {
    id?: string;
    email?: string;
    role?: string;
    // ID артист-профілю, яким керує користувач (роль ManagementUser). Бек МОЖЕ
    // класти його в claim — резолвимо за кількома ймовірними іменами. Якщо клейму
    // немає, лишається undefined, і кабінет бере artistId з localStorage (після create).
    artistId?: string;
}

// Статус відновлення сесії.
//  • loading          — ще не знаємо, refresh у польоті (перший рендер після F5);
//  • authenticated    — є токен АБО оптимістично за підказкою (поки їде refresh);
//  • unauthenticated  — refresh не вдався / гість / після logout.
// Потрібен, щоб UI не блимав гостьовим станом на секунду під час refresh.
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface SessionState {
    accessToken: string | null;
    user: SessionUser | null;
    // Чи завершилось початкове відновлення сесії (restoreSession у ApiClientProvider).
    // Доти не знаємо, артист користувач чи ні — гейти показують лоадер, а не блокер.
    authResolved: boolean;
    setAccessToken: (token: string | null) => void;
    markAuthResolved: () => void;
    clearSession: () => void;
    // Refresh завершився без токена (гість / протухла кука) — фіналізуємо стан.
    markUnauthenticated: () => void;
    // Оптимістичне підняття до 'authenticated' за localStorage-підказкою,
    // ще ДО завершення мережевого refresh — прибирає блимання гостьовим UI.
    hydrateFromHint: () => void;
}

// Підказка «минулого разу була сесія». Не токен — лише прапорець, тому її
// безпечно тримати в localStorage. Дозволяє оптимістично відрендерити
// авторизований каркас одразу, а не після refresh-запиту.
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
        // приватний режим / перевищена квота — підказка просто не збережеться
    }
};

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
    authResolved: false,
    setAccessToken: (token) => set({ accessToken: token, user: userFromToken(token) }),
    markAuthResolved: () => set({ authResolved: true }),
    clearSession: () => {
        // Прибираємо scoped-artistId поточного юзера (+ легасі-ключ), щоб
        // наступний акаунт на цьому браузері не успадкував чужий кабінет.
        clearStoredArtistId(get().user?.id);
        set({ accessToken: null, user: null });
    },
}));

// Зручний селектор для UI: чи показувати авторизований каркас.
// Включає оптимістичний стан (status === 'authenticated' без токена).
export const selectIsAuthenticated = (s: SessionState): boolean =>
    s.status === 'authenticated';
