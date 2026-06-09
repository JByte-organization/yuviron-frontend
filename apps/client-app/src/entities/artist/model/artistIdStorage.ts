// Пер-юзерне сховище artistId. Ключ скоупиться на userId, щоб профіль одного
// акаунта НЕ "протікав" іншому на тому самому браузері. Баг до скоупінгу: новий
// акаунт без артиста бачив чужий кабінет (бейдж + studio-сторінки), бо
// useCurrentArtistId фолбечився на глобальний localStorage попереднього юзера.
//
// Окремий модуль без імпорту session-стора — щоб clearSession() міг його чистити
// без циклічного імпорту (currentArtist.ts ↔ session/store.ts).
const PREFIX = 'yuviron.artistId';

// Легасі-ключ без скоупу (до пер-юзерного скоупінгу). Більше НЕ читаємо, але
// прибираємо при очистці сесії, щоб старе значення не висіло й нікому не протекло.
const LEGACY_KEY = 'yuviron.artistId';

const keyFor = (userId: string): string => `${PREFIX}.${userId}`;

export const setStoredArtistId = (
    userId: string | null | undefined,
    id: string | null,
): void => {
    if (typeof window === 'undefined' || !userId) return;
    if (id) localStorage.setItem(keyFor(userId), id);
    else localStorage.removeItem(keyFor(userId));
};

export const getStoredArtistId = (userId: string | null | undefined): string | null => {
    if (typeof window === 'undefined' || !userId) return null;
    return localStorage.getItem(keyFor(userId));
};

// Викликається з clearSession при логауті/протуханні токена. Чистить ключ
// поточного юзера + легасі-ключ без скоупу.
export const clearStoredArtistId = (userId: string | null | undefined): void => {
    if (typeof window === 'undefined') return;
    if (userId) localStorage.removeItem(keyFor(userId));
    localStorage.removeItem(LEGACY_KEY);
};
