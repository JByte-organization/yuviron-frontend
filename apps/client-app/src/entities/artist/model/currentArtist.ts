'use client';

import { useSyncExternalStore } from 'react';
import { useSessionStore } from '@/entities/session/model/store';

// У свагері artist-кабінету немає ендпоінта «список моїх артистів», а майже всі
// запити вимагають artistId (профіль — у шляху). Тому резолвимо «поточного артиста»
// з двох джерел за пріоритетом:
//   1. JWT-claim (якщо бек кладе artistId у токен ManagementUser);
//   2. localStorage — записуємо одразу після створення профілю (create-флоу).
// Якщо жодного немає → null, і сторінки показують стан «немає артиста» з CTA.
const STORAGE_KEY = 'yuviron.artistId';

export const setStoredArtistId = (id: string | null): void => {
    if (typeof window === 'undefined') return;
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
};

export const getStoredArtistId = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEY);
};

// Підписка-заглушка: значення в localStorage міняється лише через setStoredArtistId
// у цьому ж табі (без cross-tab синхронізації) — перечитуємо на кожен рендер store.
const subscribe = () => () => {};

// Читаємо localStorage через useSyncExternalStore: на сервері — null (без hydration
// mismatch), на клієнті — актуальне значення, без setState в ефекті.
const useStoredArtistId = (): string | null =>
    useSyncExternalStore(subscribe, getStoredArtistId, () => null);

// Повертає artistId поточного кабінету або null, поки резолвиться (SSR/перший рендер).
export const useCurrentArtistId = (): string | null => {
    const claimArtistId = useSessionStore((s) => s.user?.artistId);
    const stored = useStoredArtistId();
    return claimArtistId ?? stored;
};
