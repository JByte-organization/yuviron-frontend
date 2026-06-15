'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { usePostApiStudioArtistTeamAcceptInvite } from '@repo/api/artist.ts';
import {
    getApiAuthMe,
    getGetApiAuthMeQueryKey,
    type CurrentUserDto,
} from '@repo/api/client.ts';
import { setStoredArtistId } from '@/entities/artist/model/currentArtist';
import { useSessionStore } from '@/entities/session/model/store';
import { unwrap } from '@/shared/lib/unwrapApi';

/**
 * Прийняття запрошення до команди артиста. Бек шле лист із посиланням
 * /studio/invites?code=… (раніше очікували token/artistId — фактичний параметр
 * `code`, тримаємо token як фолбек). Прийняття — свідома дія, тому кнопка,
 * а не авто-сабміт (на відміну від confirm-email).
 */
export const AcceptTeamInviteCard = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    // Бек шле ?code=… ; лишаємо ?token= як фолбек на випадок старих листів.
    const token = searchParams?.get('code') ?? searchParams?.get('token') ?? '';
    // Якщо лист містить artistId — збережемо, щоб кабінет одразу відкрився
    // на потрібному артисті (accept-invite повертає 204 без тіла).
    const artistIdFromLink = searchParams?.get('artistId') ?? null;

    const userId = useSessionStore((s) => s.user?.id);
    const userEmail = useSessionStore((s) => s.user?.email);
    const queryClient = useQueryClient();

    const [error, setError] = useState<string | null>(null);
    const [alreadyMember, setAlreadyMember] = useState(false);
    const { mutateAsync: acceptInvite, isPending, isSuccess } = usePostApiStudioArtistTeamAcceptInvite();

    // Веде в кабінет артиста; якщо керований один — одразу обираємо його.
    const goToCabinet = (managed: CurrentUserDto['managedArtists']) => {
        const only = managed?.length === 1 ? managed[0]?.artistId : null;
        if (only) setStoredArtistId(userId, only);
        setTimeout(() => router.push('/artist-dashboard'), 1200);
    };

    const handleAccept = async () => {
        setError(null);
        try {
            // Після фіксу беку authorization винесено в хендлер (по токену інвайта),
            // тож поле requiredPermission прибрано зі схеми AcceptTeamInviteCommand —
            // шлемо лише token, інакше build падає на drift'і swagger при деплої.
            await acceptInvite({ data: { token } });
            if (artistIdFromLink) setStoredArtistId(userId, artistIdFromLink);
            // Тепер юзер у команді артиста → /auth/me поверне його в managedArtists.
            await queryClient.invalidateQueries({ queryKey: getGetApiAuthMeQueryKey() });
            setTimeout(() => router.push('/artist-dashboard'), 1200);
        } catch (e) {
            const res = (e as { response?: { status?: number; data?: unknown } })?.response;
            // Бек віддає помилку і як ProblemDetails (JSON), і як text/plain (рядок) —
            // читаємо обидва, інакше рядкове тіло губилось і ВСЕ падало в generic.
            const data = res?.data;
            const raw = (
                typeof data === 'string'
                    ? data
                    : (data as { detail?: string; title?: string })?.detail ||
                      (data as { detail?: string; title?: string })?.title ||
                      ''
            ).toString();
            const lower = raw.toLowerCase();

            // «Чужа пошта» показуємо ЛИШЕ якщо бек явно сказав це в тілі. Голий 403
            // (порожнє тіло) — це НЕ про пошту: підтверджено на правильній адресі бек
            // усе одно віддає 403, тобто спрацьовує authorization-gate ендпоінта, а не
            // перевірка адресата інвайта. Не звинувачуємо юзера у неправильній пошті.
            if (lower.includes('different email') || lower.includes('email address')) {
                setError(
                    `Це запрошення надіслано на іншу електронну адресу.${userEmail ? ` Ви увійшли як ${userEmail}.` : ''}` +
                    ' Увійдіть в акаунт із поштою, на яку прийшов лист, і відкрийте посилання ще раз.',
                );
                return;
            }

            // Псевдо-збій: інвайт міг уже бути прийнятий (повторний перехід / токен
            // спалено), але юзер УЖЕ в команді. Перевіряємо /auth/me свіжим запитом —
            // якщо керовані артисти є, ведемо в кабінет замість помилки. Робимо це до
            // показу будь-якої помилки, щоб покрити і 400, і випадковий 403.
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
                // /auth/me не вдалось — падаємо у звичайні гілки помилок нижче.
            }

            // Голий 403 без тіла — відмова authorization-policy на боці сервера
            // (accept-invite вимагає прав, яких у запрошеного ще нема). Користувач тут
            // безсилий: повідомляємо про серверне обмеження, не про його пошту.
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
