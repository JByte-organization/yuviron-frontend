'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentArtistId } from '@/entities/artist/model/currentArtist';
import { STUDIO_ROUTE } from './useCreateArtistProfile';

export const useRedirectIfArtist = (): boolean => {
    const router = useRouter();
    const artistId = useCurrentArtistId();

    useEffect(() => {
        if (artistId) router.replace(STUDIO_ROUTE);
    }, [artistId, router]);

    return !!artistId;
};
