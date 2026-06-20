'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
    getGetApiAuthMeQueryKey,
    postApiAuthRefresh,
    usePostApiArtistProfiles,
    usePostApiFilesUpload,
} from '@repo/api/client.ts';
import { useSessionStore } from '@/entities/session/model/store';
import { setStoredArtistId } from '@/entities/artist/model/currentArtist';
import { extractApiError, extractFileId } from './helpers';

export type CreateStatus = 'idle' | 'submitting' | 'success' | 'limit';

export const STUDIO_ROUTE = '/artist-dashboard';

export const useCreateArtistProfile = () => {
    const router = useRouter();
    const [status, setStatus] = useState<CreateStatus>('idle');
    const [artistId, setArtistId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const setAccessToken = useSessionStore((s) => s.setAccessToken);
    const queryClient = useQueryClient();

    const { mutateAsync: uploadFile } = usePostApiFilesUpload();
    const { mutateAsync: createProfile } = usePostApiArtistProfiles();

    const submit = async (name: string, avatar: File | null) => {
        setError(null);
        setStatus('submitting');
        try {
            let avatarFileId: string | null = null;
            if (avatar) {
                avatarFileId = extractFileId(await uploadFile({ data: { file: avatar } }));
            }
            const res = await createProfile({ data: { name: name.trim(), avatarFileId } });
            const r = res as unknown as { artistId?: string; data?: { artistId?: string } };
            const newArtistId = r?.data?.artistId ?? r?.artistId ?? null;
            setArtistId(newArtistId);
            setStoredArtistId(useSessionStore.getState().user?.id, newArtistId);

            let refreshedOk = false;
            try {
                const refreshed = await postApiAuthRefresh();
                const token =
                    (refreshed as { accessToken?: string; token?: string })?.accessToken ??
                    (refreshed as { accessToken?: string; token?: string })?.token;
                if (token) {
                    setAccessToken(token);
                    refreshedOk = true;
                }
            } catch {
            }

            await queryClient.invalidateQueries({ queryKey: getGetApiAuthMeQueryKey() });

            if (refreshedOk) {
                router.push(STUDIO_ROUTE);
                return;
            }

            setStatus('success');
        } catch (err) {
            if ((err as { response?: { status?: number } })?.response?.status === 403) {
                setStatus('limit');
                return;
            }
            setStatus('idle');
            setError(extractApiError(err, 'Не вдалося створити профіль артиста. Спробуйте ще раз.'));
        }
    };

    return { status, artistId, error, submit, isSubmitting: status === 'submitting' };
};
