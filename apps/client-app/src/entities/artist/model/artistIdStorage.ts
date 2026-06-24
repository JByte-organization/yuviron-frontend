const PREFIX = 'yuviron.artistId';

const LEGACY_KEY = 'yuviron.artistId';

const keyFor = (userId: string): string => `${PREFIX}.${userId}`;

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export const subscribeArtistId = (cb: () => void): (() => void) => {
    listeners.add(cb);
    return () => {
        listeners.delete(cb);
    };
};

export const setStoredArtistId = (
    userId: string | null | undefined,
    id: string | null,
): void => {
    if (typeof window === 'undefined' || !userId) return;
    if (id) localStorage.setItem(keyFor(userId), id);
    else localStorage.removeItem(keyFor(userId));
    notify();
};

export const getStoredArtistId = (userId: string | null | undefined): string | null => {
    if (typeof window === 'undefined' || !userId) return null;
    return localStorage.getItem(keyFor(userId));
};

export const clearStoredArtistId = (userId: string | null | undefined): void => {
    if (typeof window === 'undefined') return;
    if (userId) localStorage.removeItem(keyFor(userId));
    localStorage.removeItem(LEGACY_KEY);
    notify();
};
