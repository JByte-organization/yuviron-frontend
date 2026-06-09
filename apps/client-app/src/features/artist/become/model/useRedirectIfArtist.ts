'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentArtistId } from '@/entities/artist/model/currentArtist';
import { STUDIO_ROUTE } from './useCreateArtistProfile';

// Guard для сторінок «стати артистом». Якщо користувач уже керує артистом
// (artistId резолвиться з JWT-claim або scoped-localStorage), форми claim/create
// йому не потрібні — відправляємо в студію. Закриває як вхід через /become-artist,
// так і deep-link на /become-artist/{claim,create}.
//
// Повертає true, поки триває редірект (artistId є). Викликаюча сторінка має
// нічого не рендерити в цей момент, щоб не блимнути формою перед переходом.
// На SSR/першому рендері artistId === null → повертаємо false, сторінка
// рендериться нормально (як і для юзерів без артиста).
export const useRedirectIfArtist = (): boolean => {
    const router = useRouter();
    const artistId = useCurrentArtistId();

    useEffect(() => {
        if (artistId) router.replace(STUDIO_ROUTE);
    }, [artistId, router]);

    return !!artistId;
};
