'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { usePostApiAuthRegister } from '@repo/api/client.ts';
import { Gender } from '@repo/api/generated/client/models/gender';
import type { RegisterCommand } from '@repo/api/generated/client/models/registerCommand';
import { clearRegisterDraft, getRegisterDraft, type RegisterDraft } from './registerDraft';

// Собирает тело register-запроса из черновика. Дату рождения бэк ждёт ISO-строкой,
// поэтому склеиваем день/месяц/год в UTC, чтобы не словить смещение часового пояса.
const buildRegisterPayload = (draft: RegisterDraft): RegisterCommand => ({
    email: draft.email?.trim(),
    password: draft.password,
    firstName: draft.firstName?.trim(),
    country: draft.country,
    city: draft.city,
    dateOfBirth: new Date(
        Date.UTC(Number(draft.year), Number(draft.month) - 1, Number(draft.day)),
    ).toISOString(),
    gender: Gender.NotSpecified,
    acceptMarketing: false,
    acceptTerms: true,
});

// Единая точка отправки register для обоих экранов (email-шаг и шаг профиля).
// 409 Conflict = почта занята → поднимаем флаг emailTaken (модалку рисует вызывающий
// компонент). Любую другую ошибку отдаём текстом в serverError. На успехе чистим
// черновик и ведём на экран «перевірте пошту» (подтверждение идёт по ссылке из письма).
export const useRegisterSubmit = () => {
    const router = useRouter();
    const [emailTaken, setEmailTaken] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const { mutate, isPending } = usePostApiAuthRegister({
        mutation: {
            onSuccess: (_response, variables) => {
                const email = variables.data.email ?? '';
                clearRegisterDraft();
                router.push(`/register/check-email?email=${encodeURIComponent(email)}`);
            },
            onError: (error: any) => {
                if (error?.response?.status === 409) {
                    setEmailTaken(true);
                    return;
                }
                const data = error?.response?.data;
                const fieldErrors = data?.errors
                    ? Object.values(data.errors).flat().join(' ')
                    : null;
                setServerError(
                    fieldErrors ||
                        data?.detail ||
                        data?.title ||
                        data?.message ||
                        data?.error ||
                        (typeof data === 'string' ? data : null) ||
                        'Не вдалося зареєструватися. Спробуйте ще раз.',
                );
            },
        },
    });

    // Читаем черновик в момент сабмита — вызывающий пишет в него непосредственно перед.
    const submit = () => {
        setServerError(null);
        mutate({ data: buildRegisterPayload(getRegisterDraft()) });
    };

    return {
        submit,
        isPending,
        emailTaken,
        closeEmailTaken: () => setEmailTaken(false),
        serverError,
        clearServerError: () => setServerError(null),
    };
};
