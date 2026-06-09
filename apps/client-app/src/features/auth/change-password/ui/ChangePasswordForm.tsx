'use client';

import React, { type FormEvent, useState } from 'react';
import { usePostApiAuthResetPassword } from '@repo/api/client.ts';

const checkUppercase = (value: string) => /[A-Z]/.test(value);
const checkLowercase = (value: string) => /[a-z]/.test(value);
const checkDigit = (value: string) => /\d/.test(value);
const checkLength = (value: string) => value.length >= 8;

type ChangeErrors = {
    oldPassword?: string;
    password?: string;
    confirm?: string;
};

const validate = (oldPassword: string, password: string, confirm: string): ChangeErrors => {
    const errors: ChangeErrors = {};

    if (!oldPassword) {
        errors.oldPassword = 'Введіть поточний пароль';
    }

    if (!password) {
        errors.password = 'Введіть новий пароль';
    } else if (
        !checkUppercase(password) ||
        !checkLowercase(password) ||
        !checkDigit(password) ||
        !checkLength(password)
    ) {
        errors.password =
            'Пароль має містити велику й малу літери, цифру та бути не коротшим за 8 символів';
    } else if (password === oldPassword) {
        errors.password = 'Новий пароль не може співпадати з поточним';
    }

    if (!confirm) {
        errors.confirm = 'Повторіть новий пароль';
    } else if (confirm !== password) {
        errors.confirm = 'Паролі не співпадають';
    }

    return errors;
};

export const ChangePasswordForm = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [errors, setErrors] = useState<ChangeErrors>({});
    const [submitted, setSubmitted] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [done, setDone] = useState(false);

    const { mutate, isPending } = usePostApiAuthResetPassword({
        mutation: {
            onSuccess: () => {
                setDone(true);
                setOldPassword('');
                setPassword('');
                setConfirm('');
                setSubmitted(false);
                setErrors({});
            },
            onError: (err: any) => {
                const status = err?.response?.status;
                if (status === 401 || status === 400 && err?.response?.data?.message?.includes('password')) {
                    setServerError('Поточний пароль невірний.');
                    return;
                }
                const data = err?.response?.data;
                const fieldErrors = data?.errors
                    ? Object.values(data.errors).flat().join(' ')
                    : null;
                setServerError(
                    fieldErrors ||
                    data?.detail ||
                    data?.title ||
                    data?.message ||
                    'Не вдалося змінити пароль. Спробуйте ще раз.',
                );
            },
        },
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitted(true);
        setServerError(null);
        setDone(false);
        const next = validate(oldPassword, password, confirm);
        setErrors(next);
        if (Object.keys(next).length > 0) return;

        const requestPayload = {
            oldPassword,
            newPassword: password
        };

        mutate({
            data: requestPayload as Parameters<typeof mutate>[0]['data']
        });
    };

    const revalidate = (patch: { oldPassword?: string; password?: string; confirm?: string }) => {
        if (!submitted) return;
        setErrors(
            validate(
                patch.oldPassword ?? oldPassword,
                patch.password ?? password,
                patch.confirm ?? confirm,
            ),
        );
    };

    return (
        <div className="client-reset-form">
            <h1 className="client-reset-form__title">Зміна паролю</h1>

            <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                    <label htmlFor="oldPassword" className="form-label client-reset-form__label">
                        Поточний пароль
                    </label>
                    <div className="client-reset-form__password-wrap">
                        <input
                            id="oldPassword"
                            type={showOld ? 'text' : 'password'}
                            className={`form-control client-reset-form__input client-reset-form__input--password${errors.oldPassword ? ' is-invalid' : ''}`}
                            placeholder="****************"
                            value={oldPassword}
                            onChange={(event) => {
                                setOldPassword(event.target.value);
                                revalidate({ oldPassword: event.target.value });
                            }}
                        />
                        <button
                            type="button"
                            className="client-reset-form__toggle"
                            onClick={() => setShowOld((prev) => !prev)}
                            aria-label={showOld ? 'Сховати пароль' : 'Показати пароль'}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </button>
                    </div>
                    {errors.oldPassword && (
                        <div className="client-reset-form__error">{errors.oldPassword}</div>
                    )}
                </div>

                <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label client-reset-form__label">
                        Новий пароль
                    </label>
                    <div className="client-reset-form__password-wrap">
                        <input
                            id="newPassword"
                            type={showNew ? 'text' : 'password'}
                            className={`form-control client-reset-form__input client-reset-form__input--password${errors.password ? ' is-invalid' : ''}`}
                            placeholder="****************"
                            value={password}
                            onChange={(event) => {
                                setPassword(event.target.value);
                                revalidate({ password: event.target.value });
                            }}
                        />
                        <button
                            type="button"
                            className="client-reset-form__toggle"
                            onClick={() => setShowNew((prev) => !prev)}
                            aria-label={showNew ? 'Сховати пароль' : 'Показати пароль'}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </button>
                    </div>
                    {errors.password && (
                        <div className="client-reset-form__error">{errors.password}</div>
                    )}
                </div>

                <div className="mb-4">
                    <label htmlFor="repeatPassword" className="form-label client-reset-form__label">
                        Повторіть новий пароль
                    </label>
                    <div className="client-reset-form__password-wrap">
                        <input
                            id="repeatPassword"
                            type={showConfirm ? 'text' : 'password'}
                            className={`form-control client-reset-form__input client-reset-form__input--password${errors.confirm ? ' is-invalid' : ''}`}
                            placeholder="****************"
                            value={confirm}
                            onChange={(event) => {
                                setConfirm(event.target.value);
                                revalidate({ confirm: event.target.value });
                            }}
                        />
                        <button
                            type="button"
                            className="client-reset-form__toggle"
                            onClick={() => setShowConfirm((prev) => !prev)}
                            aria-label={showConfirm ? 'Сховати пароль' : 'Показати пароль'}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </button>
                    </div>
                    {errors.confirm && (
                        <div className="client-reset-form__error">{errors.confirm}</div>
                    )}
                </div>

                {serverError && (
                    <div className="client-reset-form__error mb-3">{serverError}</div>
                )}
                {done && (
                    <div className="client-reset-form__success mb-3">Пароль успішно змінено.</div>
                )}

                <button
                    type="submit"
                    className="btn client-reset-form__submit w-100"
                    disabled={isPending}
                >
                    {isPending ? 'Зміна паролю…' : 'Змінити пароль'}
                </button>
            </form>
        </div>
    );
};

export default ChangePasswordForm;