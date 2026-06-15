'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
    AppPermission,
    usePostApiStudioArtistTeamAcceptInvite,
} from '@repo/api/artist.ts';
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
            await acceptInvite({
                data: { token, requiredPermission: AppPermission.AccessBasic },
            });
            if (artistIdFromLink) setStoredArtistId(userId, artistIdFromLink);
            // Тепер юзер у команді артиста → /auth/me поверне його в managedArtists.
            await queryClient.invalidateQueries({ queryKey: getGetApiAuthMeQueryKey() });
            setTimeout(() => router.push('/artist-dashboard'), 1200);
        } catch (e) {
            const res = (e as { response?: { status?: number; data?: { detail?: string; title?: string } } })?.response;
            const raw = (res?.data?.detail || res?.data?.title || '').toString();
            const lower = raw.toLowerCase();

            // Інвайт привʼязаний до конкретної пошти — найчастіша помилка: юзер
            // увійшов іншим акаунтом. Локалізуємо й підказуємо, що робити.
            if (lower.includes('different email') || lower.includes('email address')) {
                setError(
                    `Це запрошення надіслано на іншу електронну адресу.${userEmail ? ` Ви увійшли як ${userEmail}.` : ''}` +
                    ' Увійдіть в акаунт із поштою, на яку прийшов лист, і відкрийте посилання ще раз.',
                );
                return;
            }

            // Найчастіший «псевдо-збій»: інвайт уже прийнято раніше (повторний перехід
            // по листу) — токен спалено, бек віддає 400, але юзер УЖЕ в команді. Не
            // лякаємо помилкою: перевіряємо /auth/me свіжим запитом і, якщо керовані
            // артисти є, ведемо просто в кабінет.
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
