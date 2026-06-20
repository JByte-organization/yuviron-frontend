'use client';

import { useSyncExternalStore } from 'react';
import { useSessionStore } from '@/entities/session/model/store';
import { getStoredArtistId, subscribeArtistId } from './artistIdStorage';
import { useManagedArtists } from './managedArtists';

export { setStoredArtistId } from './artistIdStorage';

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

export const useCurrentArtist = (): CurrentArtist => {
    const claimArtistId = useSessionStore((s) => s.user?.artistId);
    const userId = useSessionStore((s) => s.user?.id);
    const stored = useStoredArtistId(userId);
    const { artists, isLoading } = useManagedArtists();

    const managedId = artists[0]?.artistId ?? null;
    const selectedIsManaged = !!stored && artists.some((a) => a.artistId === stored);
    const artistId = selectedIsManaged
        ? stored
        : (managedId ?? claimArtistId ?? stored ?? null);
    const role = artists.find((a) => a.artistId === artistId)?.role ?? null;
    const canManage = role !== 'Viewer';

    const isResolving = isLoading && !claimArtistId && !stored;

    return { artistId, role, canManage, isResolving };
};

export const useCurrentArtistId = (): string | null => useCurrentArtist().artistId;
