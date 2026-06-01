'use client';

import Link from 'next/link';
import { type FormEvent, useState } from 'react';
import { usePostApiAuthForgotPassword } from '@repo/api/client.ts';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) return 'Введіть електронну пошту';
    if (!EMAIL_REGEX.test(email.trim())) return 'Некоректний формат пошти';
    return undefined;
};

export const ForgotPasswordForm = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | undefined>();
    const [submitted, setSubmitted] = useState(false);
    const [sent, setSent] = useState(false);

    const { mutate, isPending } = usePostApiAuthForgotPassword({
        mutation: {
            onSuccess: () => {
                setSent(true);
            },
            onError: () => {
                // Бэк специально не различает "email есть"/"нет" чтобы не
                // палить базу — но 4xx могут прилететь при rate-limit и т.п.
                // Показываем тот же success-state, чтобы не палить базу с фронта тоже.
                setSent(true);
            },
        },
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitted(true);
        const next = validateEmail(email);
        setError(next);
        if (next) return;
        mutate({ data: { email: email.trim() } });
    };

    return (
        <div className="client-forgot-form">
            <div className="client-forgot-form__top">
                <Link
                    href="/login"
                    className="client-forgot-form__back text-decoration-none"
                >
                    Назад
                </Link>
            </div>

            <div className="client-forgot-form__logo">
                <img
                    src="/logo.svg"
                    alt="Yuviron"
                    className="client-forgot-form__logo-image"
                />
            </div>

            <h1 className="client-forgot-form__title">Забули пароль?</h1>

            {sent ? (
                <p className="client-forgot-form__subtitle">
                    Якщо акаунт з адресою <strong>{email.trim()}</strong> існує,
                    ми надіслали на нього лист із посиланням для скидання паролю.
                    Перевірте поштову скриньку.
                </p>
            ) : (
                <form onSubmit={handleSubmit} noValidate>
                    <div className="mb-4">
                        <label htmlFor="email" className="form-label client-forgot-form__label">
                            Електронна пошта
                        </label>
                        <input
                            id="email"
                            type="email"
                            className={`form-control client-forgot-form__input${error ? ' is-invalid' : ''}`}
                            placeholder="@gmail.com"
                            value={email}
                            onChange={(event) => {
                                setEmail(event.target.value);
                                if (submitted) setError(validateEmail(event.target.value));
                            }}
                            disabled={isPending}
                        />
                        {error && <div className="client-forgot-form__error">{error}</div>}
                    </div>

                    <button
                        type="submit"
                        className="btn client-forgot-form__submit w-100"
                        disabled={isPending}
                    >
                        {isPending ? 'Надсилання…' : 'Продовжити'}
                    </button>
                </form>
            )}

            <div className="client-forgot-form__bottom-divider" />

            <div className="client-forgot-form__login text-center">
                <span>Раптом згадали?</span>
                <Link href="/login" className="client-forgot-form__login-link text-decoration-none">
                    Увійти до акаунту
                </Link>
            </div>
        </div>
    );
};

export default ForgotPasswordForm;
