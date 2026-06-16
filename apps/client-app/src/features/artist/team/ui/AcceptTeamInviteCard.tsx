'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    customInstance,
    getApiAuthMe,
    getGetApiAuthMeQueryKey,
    type CurrentUserDto,
} from '@repo/api/client.ts';
import { setStoredArtistId } from '@/entities/artist/model/currentArtist';
import { useSessionStore } from '@/entities/session/model/store';
import { unwrap } from '@/shared/lib/unwrapApi';

export const AcceptTeamInviteCard = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams?.get('code') ?? searchParams?.get('token') ?? '';
    const artistIdFromLink = searchParams?.get('artistId') ?? null;

    const userId = useSessionStore((s) => s.user?.id);
    const userEmail = useSessionStore((s) => s.user?.email);
    const queryClient = useQueryClient();

    const [error, setError] = useState<string | null>(null);
    const [alreadyMember, setAlreadyMember] = useState(false);
    const { mutateAsync: acceptInvite, isPending, isSuccess } = useMutation({
        mutationFn: (vars: { token: string }) =>
            customInstance<void>('/api/artist-profiles/accept-invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: vars.token }),
            }),
    });

    const goToCabinet = (managed: CurrentUserDto['managedArtists']) => {
        const only = managed?.length === 1 ? managed[0]?.artistId : null;
        if (only) setStoredArtistId(userId, only);
        setTimeout(() => router.push('/artist-dashboard'), 1200);
    };

    const handleAccept = async () => {
        setError(null);
        try {
            await acceptInvite({ token });
            if (artistIdFromLink) setStoredArtistId(userId, artistIdFromLink);
            await queryClient.invalidateQueries({ queryKey: getGetApiAuthMeQueryKey() });
            setTimeout(() => router.push('/artist-dashboard'), 1200);
        } catch (e) {
            const res = (e as { response?: { status?: number; data?: unknown } })?.response;
            const data = res?.data;
            const data2 = data as { detail?: string; title?: string; rawText?: string };
            const raw = (
                typeof data === 'string'
                    ? data
                    : data2?.detail || data2?.title || data2?.rawText || ''
            ).toString();
            const lower = raw.toLowerCase();

            if (lower.includes('different email') || lower.includes('email address')) {
                setError(
                    `Це запрошення надіслано на іншу електронну адресу.${userEmail ? ` Ви увійшли як ${userEmail}.` : ''}` +
                    ' Увійдіть в акаунт із поштою, на яку прийшов лист, і відкрийте посилання ще раз.',
                );
                return;
            }

            try {
                const fresh = unwrap<CurrentUserDto>(await getApiAuthMe());
                const managed = fresh?.managedArtists ?? [];
                if (managed.length > 0) {
                    await queryClient.invalidateQueries({ queryKey: getGetApiAuthMeQueryKey() });
                    setAlreadyMember(true);
                    goToCabinet(managed);
                    return;
                }
            } catch {
            }

            if (res?.status === 403) {
                setError(
                    'Не вдалося прийняти запрошення: сервер відхилив запит (помилка доступу). ' +
                    'Імовірно, це обмеження на боці сервера — повідомте власника кабінету або спробуйте пізніше.',
                );
                return;
            }

            if (res?.status === 404 || lower.includes('not found') || lower.includes('expired')) {
                setError('Запрошення недійсне або застаріле. Попросіть надіслати нове.');
            } else {
                setError('Не вдалося прийняти запрошення. Спробуйте ще раз або попросіть надіслати нове.');
            }
        }
    };

    if (!token) {
        return (
            <div className="client-forgot-form">
                <h1 className="client-forgot-form__title">Запрошення до команди</h1>
                <p className="client-forgot-form__subtitle">
                    Посилання недійсне: відсутній токен запрошення.
                </p>
                <Link href="/home" className="btn client-forgot-form__submit w-100 text-decoration-none">
                    На головну
                </Link>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="client-forgot-form">
                <h1 className="client-forgot-form__title">Вітаємо в команді!</h1>
                <p className="client-forgot-form__subtitle">
                    Запрошення прийнято. Переходимо до кабінету артиста…
                </p>
            </div>
        );
    }

    if (alreadyMember) {
        return (
            <div className="client-forgot-form">
                <h1 className="client-forgot-form__title">Ви вже в команді</h1>
                <p className="client-forgot-form__subtitle">
                    Це запрошення вже прийнято раніше. Переходимо до кабінету артиста…
                </p>
                <Link href="/artist-dashboard" className="btn client-forgot-form__submit w-100 text-decoration-none">
                    Перейти до кабінету
                </Link>
            </div>
        );
    }

    return (
        <div className="client-forgot-form">
            <h1 className="client-forgot-form__title">Запрошення до команди</h1>
            <p className="client-forgot-form__subtitle">
                Вас запросили до команди артиста. Після прийняття ви отримаєте
                доступ до кабінету відповідно до призначеної ролі.
            </p>
            {error && <div className="client-modal__field-error mb-2">{error}</div>}
            <button
                className="btn client-forgot-form__submit w-100"
                disabled={isPending}
                onClick={handleAccept}
            >
                {isPending ? 'Приймаємо…' : 'Прийняти запрошення'}
            </button>
        </div>
    );
};
