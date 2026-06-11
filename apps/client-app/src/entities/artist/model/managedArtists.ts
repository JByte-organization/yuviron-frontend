'use client';

import {
    getGetApiAuthMeQueryKey,
    useGetApiAuthMe,
    type CurrentUserDto,
    type UserManagedArtistDto,
} from '@repo/api/client.ts';
import { useSessionStore } from '@/entities/session/model/store';
import { unwrap } from '@/shared/lib/unwrapApi';

// Список артистів, якими керує користувач — авторитетне джерело з /auth/me
// (CurrentUserDto.managedArtists). Бек додав це поле, тож більше не треба гадати
// artistId з JWT-claim/localStorage. /auth/me вже кешується react-query (його
// смикають хедер, профіль тощо) — тут лише підписка на той самий кеш, без зайвого
// мережевого виклику. enabled привʼязаний до токена, щоб не смикати для анонімів.
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
