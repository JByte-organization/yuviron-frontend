'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    postApiAuthRefresh,
    usePostApiArtistProfiles,
    usePostApiFilesUpload,
} from '@repo/api/client.ts';
import { useSessionStore } from '@/entities/session/model/store';
import { setStoredArtistId } from '@/entities/artist/model/currentArtist';
import { extractApiError, extractFileId } from './helpers';

// idle → submitting → success (рефреш не удался — показываем экран с ручной
// ссылкой в студию) | limit (403 — лимит на free).
export type CreateStatus = 'idle' | 'submitting' | 'success' | 'limit';

// Студия артиста в этом приложении = /artist-dashboard.
export const STUDIO_ROUTE = '/artist-dashboard';

// Путь 2: «создать нового артиста». Опциональный аватар грузим отдельным
// запросом (/files/upload) и передаём avatarFileId в create. На успешном create
// бэк выдаёт роль ManagementUser — старый JWT её не знает (ТЗ п.2), поэтому
// ОБЯЗАТЕЛЬНО рефрешим токен ДО входа в студию, иначе бэк отдаст 403.
// При успешном рефреше сразу пускаем в студию (router.push), иначе остаёмся на
// экране успеха с ручной ссылкой — роль подхватится при следующем рефреше.
export const useCreateArtistProfile = () => {
    const router = useRouter();
    const [status, setStatus] = useState<CreateStatus>('idle');
    const [artistId, setArtistId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const setAccessToken = useSessionStore((s) => s.setAccessToken);

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
            // Зберігаємо для кабінету: studio-API вимагає artistId, а ендпоінта
            // «мій артист» немає. Це єдине джерело id до появи claim у JWT.
            setStoredArtistId(newArtistId);

            // Рефреш роли перед входом в студию.
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
                /* fallback на экран успеха */
            }

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
