'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { usePostApiAuthRegister } from '@repo/api/client.ts';
import { Gender } from '@repo/api/generated/client/models/gender';
import type { RegisterCommand } from '@repo/api/generated/client/models/registerCommand';
import { clearRegisterDraft, getRegisterDraft, type RegisterDraft } from './registerDraft';

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
            onError: (error: unknown) => {
                const response = (
                    error as { response?: { status?: number; data?: unknown } }
                )?.response;
                if (response?.status === 409) {
                    setEmailTaken(true);
                    return;
                }
                const data = response?.data as
                    | {
                          errors?: Record<string, string[]>;
                          detail?: string;
                          title?: string;
                          message?: string;
                          error?: string;
                      }
                    | string
                    | undefined;
                const objData =
                    typeof data === 'object' && data !== null ? data : undefined;
                const fieldErrors = objData?.errors
                    ? Object.values(objData.errors).flat().join(' ')
                    : null;
                const rawMessage = [
                    objData?.detail,
                    objData?.title,
                    objData?.message,
                    objData?.error,
                    typeof data === 'string' ? data : null,
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();

                const isDbSaveError =
                    response?.status === 500 ||
                    rawMessage.includes('saving to the database') ||
                    rawMessage.includes('database');

                setServerError(
                    fieldErrors
                        ? fieldErrors
                        : isDbSaveError
                          ? 'Не вдалося завершити реєстрацію. Можливо, ця пошта вже зареєстрована або сервіс тимчасово недоступний. Спробуйте іншу пошту чи повторіть пізніше.'
                          : 'Не вдалося зареєструватися. Спробуйте ще раз.',
                );
            },
        },
    });

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
