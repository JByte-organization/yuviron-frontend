'use client';

import { useSyncExternalStore } from 'react';
import { useSessionStore } from '@/entities/session/model/store';
import { getStoredArtistId, subscribeArtistId } from './artistIdStorage';
import { useManagedArtists } from './managedArtists';

export { setStoredArtistId } from './artistIdStorage';

const useStoredArtistId = (userId: string | null | undefined): string | null =>
    useSyncExternalStore(subscribeArtistId, () => getStoredArtistId(userId), () => null);

interface CurrentArtist {
    artistId: string | null;
    role: string | null;
    canManage: boolean;
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
