'use client';

import {
    getGetApiAuthMeQueryKey,
    useGetApiAuthMe,
    type CurrentUserDto,
    type UserManagedArtistDto,
} from '@repo/api/client.ts';
import { useSessionStore } from '@/entities/session/model/store';
import { unwrap } from '@/shared/lib/unwrapApi';

export const useManagedArtists = (): {
    artists: UserManagedArtistDto[];
    isLoading: boolean;
} => {
    const hasToken = useSessionStore((s) => !!s.accessToken);
    const { data, isLoading } = useGetApiAuthMe({
        query: { enabled: hasToken, queryKey: getGetApiAuthMeQueryKey() },
    });
    const me = unwrap<CurrentUserDto>(data);
    return {
        artists: me?.managedArtists ?? [],
        isLoading: hasToken && isLoading,
    };
};
