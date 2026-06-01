'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { usePostApiAuthResetPassword } from '@repo/api/client.ts';

const checkUppercase = (value: string) => /[A-Z]/.test(value);
const checkLowercase = (value: string) => /[a-z]/.test(value);
const checkDigit = (value: string) => /\d/.test(value);
const checkLength = (value: string) => value.length >= 8;

type ResetErrors = {
    password?: string;
    confirm?: string;
};

const validate = (password: string, confirm: string): ResetErrors => {
    const errors: ResetErrors = {};

    if (!password) {
        errors.password = 'Введіть пароль';
    } else if (
        !checkUppercase(password) ||
        !checkLowercase(password) ||
        !checkDigit(password) ||
        !checkLength(password)
    ) {
        errors.password =
            'Пароль має містити велику й малу літери, цифру та бути не коротшим за 8 символів';
    }

    if (!confirm) {
        errors.confirm = 'Повторіть пароль';
    } else if (confirm !== password) {
        errors.confirm = 'Паролі не співпадають';
    }

    return errors;
};

export const ResetPasswordForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [errors, setErrors] = useState<ResetErrors>({});
    const [submitted, setSubmitted] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const { mutate, isPending } = usePostApiAuthResetPassword({
        mutation: {
            onSuccess: () => {
                router.push('/login');
            },
            onError: (err: any) => {
                const data = err?.response?.data;
                const fieldErrors = data?.errors
                    ? Object.values(data.errors).flat().join(' ')
                    : null;
                setServerError(
                    fieldErrors ||
                        data?.detail ||
                        data?.title ||
                        data?.message ||
                        'Не вдалося змінити пароль. Можливо, посилання вже не дійсне.',
                );
            },
        },
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitted(true);
        setServerError(null);
        if (!token) {
            setServerError('Невалідне посилання для скидання паролю.');
            return;
        }
        const next = validate(password, confirm);
        setErrors(next);
        if (Object.keys(next).length > 0) return;
        mutate({ data: { token, newPassword: password } });
    };

    return (
        <div className="client-reset-form">
            <div className="client-reset-form__top">
                <Link
                    href="/login"
                    className="client-reset-form__back text-decoration-none"
                >
                    Назад
                </Link>
            </div>

            <div className="client-reset-form__logo">
                <img
                    src="/logo.svg"
                    alt="Yuviron"
                    className="client-reset-form__logo-image"
                />
            </div>

            <h1 className="client-reset-form__title">Придумайте новий пароль</h1>

            <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label client-reset-form__label">
                        Пароль
                    </label>

                    <div className="client-reset-form__password-wrap">
                        <input
                            id="newPassword"
                            type={showPassword ? 'text' : 'password'}
                            className={`form-control client-reset-form__input client-reset-form__input--password${errors.password ? ' is-invalid' : ''}`}
                            placeholder="****************"
                            value={password}
                            onChange={(event) => {
                                setPassword(event.target.value);
                                if (submitted) setErrors(validate(event.target.value, confirm));
                            }}
                        />

                        <button
                            type="button"
                            className="client-reset-form__toggle"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={showPassword ? 'Сховати пароль' : 'Показати пароль'}
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
                        Повторіть пароль
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
                                if (submitted) setErrors(validate(password, event.target.value));
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

                <button
                    type="submit"
                    className="btn client-reset-form__submit w-100"
                    disabled={isPending}
                >
                    {isPending ? 'Зміна паролю…' : 'Змінити пароль'}
                </button>
            </form>

            <div className="client-reset-form__bottom-divider" />

            <div className="client-reset-form__login text-center">
                <span>Будуть проблеми?</span>
                <Link href="/login" className="client-reset-form__login-link text-decoration-none">
                    Звернутися до експерта
                </Link>
            </div>
        </div>
    );
};

export default ResetPasswordForm;
