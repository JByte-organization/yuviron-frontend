'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) return 'Введіть електронну пошту';
    if (!EMAIL_REGEX.test(email.trim())) return 'Некоректний формат пошти';
    return undefined;
};

export const ForgotPasswordForm = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | undefined>();
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitted(true);
        const next = validateEmail(email);
        setError(next);
        if (next) return;
        router.push('/verify-code');
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
                    src="/Logo.svg"
                    alt="LumiTune"
                    className="client-forgot-form__logo-image"
                />
            </div>

            <h1 className="client-forgot-form__title">Забули пароль?</h1>

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
                    />
                    {error && <div className="client-forgot-form__error">{error}</div>}
                </div>

                <button type="submit" className="btn client-forgot-form__submit w-100">
                    Продовжити
                </button>
            </form>

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
