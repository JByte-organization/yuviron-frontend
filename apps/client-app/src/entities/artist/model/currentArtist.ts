'use client';

import { useSyncExternalStore } from 'react';
import { useSessionStore } from '@/entities/session/model/store';
import { getStoredArtistId } from './artistIdStorage';

// У свагері artist-кабінету немає ендпоінта «список моїх артистів», а майже всі
// запити вимагають artistId (профіль — у шляху). Тому резолвимо «поточного артиста»
// з двох джерел за пріоритетом:
//   1. JWT-claim (бек кладе artistId у токен ManagementUser);
//   2. localStorage, СКОУПЛЕНИЙ на userId — записуємо після create-флоу/інвайту.
// Якщо жодного немає → null, і сторінки показують стан «немає артиста» з CTA.
//
// Сховище — у окремому artistIdStorage.ts (без імпорту session-стора), щоб
// clearSession міг чистити його без циклічного імпорту.
export { setStoredArtistId } from './artistIdStorage';

// Підписка-заглушка: значення в localStorage міняється лише через setStoredArtistId
// у цьому ж табі (без cross-tab синхронізації) — перечитуємо на кожен рендер,
// що ререндериться при зміні user у session-сторі (зміна акаунта → новий ключ).
const subscribe = () => () => {};

// Читаємо scoped-localStorage через useSyncExternalStore: на сервері — null (без
// hydration mismatch), на клієнті — актуальне значення для поточного userId.
const useStoredArtistId = (userId: string | null | undefined): string | null =>
    useSyncExternalStore(subscribe, () => getStoredArtistId(userId), () => null);

// Повертає artistId поточного кабінету або null, поки резолвиться (SSR/перший рендер).
export const useCurrentArtistId = (): string | null => {
    const claimArtistId = useSessionStore((s) => s.user?.artistId);
    const userId = useSessionStore((s) => s.user?.id);
    const stored = useStoredArtistId(userId);
    return claimArtistId ?? stored ?? null;
};
