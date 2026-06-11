'use client';

import { useSyncExternalStore } from 'react';
import { useSessionStore } from '@/entities/session/model/store';
import { getStoredArtistId, subscribeArtistId } from './artistIdStorage';
import { useManagedArtists } from './managedArtists';

// «Поточний артист» резолвиться за пріоритетом:
//   1. managedArtists з /auth/me — АВТОРИТЕТНЕ джерело (бек віддає список артистів,
//      якими керує юзер). З'явилось у свагері — раніше його не було, звідси костилі нижче.
//   2. JWT-claim artistId — швидкий шлях, поки /auth/me ще вантажиться (анти-мерехтіння).
//   3. localStorage, СКОУПЛЕНИЙ на userId — місток одразу після create-флоу/інвайту,
//      доки /auth/me не перечитав свіжий managedArtists.
// Жодного → null, сторінки показують стан «немає артиста» з CTA.
//
// Сховище — у окремому artistIdStorage.ts (без імпорту session-стора), щоб
// clearSession міг чистити його без циклічного імпорту.
export { setStoredArtistId } from './artistIdStorage';

// Читаємо scoped-localStorage через useSyncExternalStore: на сервері — null (без
// hydration mismatch), на клієнті — актуальне значення для поточного userId.
// Підписка реальна (subscribeArtistId): switcher пише новий вибір → всі споживачі
// перечитують і перемикаються на нового артиста без перезавантаження.
const useStoredArtistId = (userId: string | null | undefined): string | null =>
    useSyncExternalStore(subscribeArtistId, () => getStoredArtistId(userId), () => null);

interface CurrentArtist {
    /** artistId поточного кабінету або null, поки не резолвилось. */
    artistId: string | null;
    /** Роль у цьому артисті (Owner/Manager/Editor/Viewer) з managedArtists, якщо відома. */
    role: string | null;
    /**
     * Чи може користувач керувати (створювати/редагувати/видаляти). Read-only лише
     * для явного Viewer; Owner/Manager/Editor та невідома роль (null/Unknown) —
     * повний доступ, щоб НЕ зламати власників (їх роль ≠ Viewer). Бек все одно
     * перевіряє права — це лише UX, ховаємо кнопки, які все одно дали б 403.
     */
    canManage: boolean;
    /** true, доки /auth/me вантажиться І немає швидкого fallback'у — гейту не мигати. */
    isResolving: boolean;
}

// Богатий резолвер: artistId + роль + ознака «ще резолвиться» (для гейта/світчера).
export const useCurrentArtist = (): CurrentArtist => {
    const claimArtistId = useSessionStore((s) => s.user?.artistId);
    const userId = useSessionStore((s) => s.user?.id);
    const stored = useStoredArtistId(userId);
    const { artists, isLoading } = useManagedArtists();

    // Якщо збережений вибір (switcher) є СЕРЕД керованих артистів — поважаємо його;
    // інакше дефолт на перший. До завантаження /auth/me (список порожній) — fast-path
    // claim/stored, щоб кабінет не мигав гейтом.
    const managedId = artists[0]?.artistId ?? null;
    const selectedIsManaged = !!stored && artists.some((a) => a.artistId === stored);
    const artistId = selectedIsManaged
        ? stored
        : (managedId ?? claimArtistId ?? stored ?? null);
    const role = artists.find((a) => a.artistId === artistId)?.role ?? null;
    const canManage = role !== 'Viewer';

    // Поки /auth/me вантажиться, але вже є claim/stored — НЕ резолвимось (показуємо
    // кабінет одразу, без мигання гейтом). Резолвимось лише коли іншого id немає.
    const isResolving = isLoading && !claimArtistId && !stored;

    return { artistId, role, canManage, isResolving };
};

// Повертає artistId поточного кабінету або null. Тонка обгортка над useCurrentArtist
// для 16+ існуючих споживачів, яким потрібен лише id.
export const useCurrentArtistId = (): string | null => useCurrentArtist().artistId;
