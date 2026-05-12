'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { usePostApiAuthLogin } from '@repo/api';
import { useSessionStore } from '@/entities/session/model/store';

type LoginErrors = {
    identifier?: string;
    password?: string;
};

const validate = (identifier: string, password: string): LoginErrors => {
    const errors: LoginErrors = {};

    if (!identifier.trim()) {
        errors.identifier = 'Введіть електронну пошту або ім’я користувача';
    } else if (identifier.trim().length < 3) {
        errors.identifier = 'Мінімум 3 символи';
    }

    if (!password) {
        errors.password = 'Введіть пароль';
    } else if (password.length < 6) {
        errors.password = 'Мінімум 6 символів';
    }

    return errors;
};

export const LoginForm = () => {
    const router = useRouter();
    const setAccessToken = useSessionStore((state) => state.setAccessToken);
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<LoginErrors>({});
    const [submitted, setSubmitted] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const { mutate, isPending } = usePostApiAuthLogin({
        mutation: {
            onSuccess: (response: any) => {
                const data = response?.data ?? response;
                const token = data?.token;

                if (!token) {
                    setServerError('Не вдалося отримати токен. Спробуйте ще раз.');
                    return;
                }

                setAccessToken(token);
                router.push('/');
            },
            onError: (error: any) => {
                console.log('[login] status:', error?.response?.status);
                console.log('[login] data:', JSON.stringify(error?.response?.data, null, 2));
                const status = error?.response?.status;
                if (status === 401) {
                    setServerError('Невірний email або пароль');
                    return;
                }
                const data = error?.response?.data;
                const fieldErrors = data?.errors
                    ? Object.values(data.errors).flat().join(' ')
                    : null;
                const message =
                    fieldErrors ||
                    data?.detail ||
                    data?.title ||
                    data?.message ||
                    data?.error ||
                    (typeof data === 'string' ? data : null) ||
                    'Не вдалося увійти. Спробуйте ще раз.';
                setServerError(message);
            },
        },
    });

    const runValidation = (next: { identifier?: string; password?: string }) => {
        if (!submitted) return;
        setErrors(validate(next.identifier ?? identifier, next.password ?? password));
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitted(true);
        setServerError(null);
        const nextErrors = validate(identifier, password);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        mutate({ data: { email: identifier.trim(), password } });
    };

    return (
        <form className="client-login-form" onSubmit={handleSubmit} noValidate>
            <div className="client-login-form__socials">
                <button type="button" className="client-login-form__social-btn">
                    <span className="client-login-form__social-icon client-login-form__social-icon--facebook">
                        f
                    </span>
                    <span>Увійти з Facebook</span>
                </button>

                <button type="button" className="client-login-form__social-btn">
                    <span className="client-login-form__social-icon client-login-form__social-icon--google">
                        G
                    </span>
                    <span>Увійти з Google</span>
                </button>

                <button type="button" className="client-login-form__social-btn">
                    <span className="client-login-form__social-icon client-login-form__social-icon--apple">

                    </span>
                    <span>Увійти з Apple</span>
                </button>
            </div>

            <div className="client-login-form__divider" />

            <div className="mb-3">
                <label htmlFor="identifier" className="form-label client-login-form__label">
                    Електронна пошта або ім’я користувача
                </label>
                <input
                    id="identifier"
                    type="text"
                    className={`form-control client-login-form__input${errors.identifier ? ' is-invalid' : ''}`}
                    placeholder="@gmail.com"
                    value={identifier}
                    onChange={(event) => {
                        setIdentifier(event.target.value);
                        runValidation({ identifier: event.target.value });
                    }}
                />
                {errors.identifier && (
                    <div className="client-login-form__error">{errors.identifier}</div>
                )}
            </div>

            <div className="mb-4">
                <div className="client-login-form__password-head">
                    <label htmlFor="password" className="form-label client-login-form__label mb-0">
                        Пароль
                    </label>

                    <Link
                        href="/forgot-password"
                        className="client-login-form__forgot text-decoration-none"
                    >
                        Забули пароль?
                    </Link>
                </div>

                <div className="client-login-form__password-wrap">
                    <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        className={`form-control client-login-form__input client-login-form__input--password${errors.password ? ' is-invalid' : ''}`}
                        placeholder="**************"
                        value={password}
                        onChange={(event) => {
                            setPassword(event.target.value);
                            runValidation({ password: event.target.value });
                        }}
                    />

                    <button
                        type="button"
                        className="client-login-form__toggle"
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
                    <div className="client-login-form__error">{errors.password}</div>
                )}
            </div>

            {serverError && (
                <div className="client-login-form__error mb-3">{serverError}</div>
            )}

            <button
                type="submit"
                className="btn client-login-form__submit w-100"
                disabled={isPending}
            >
                {isPending ? 'Вхід…' : 'Увійти'}
            </button>

            <div className="client-login-form__bottom-divider" />

            <div className="client-login-form__register text-center">
                <span>Немає акаунта?</span>
                <Link href="/register" className="client-login-form__register-link text-decoration-none">
                    Реєстрація у LumiTune
                </Link>
            </div>
        </form>
    );
};

export default LoginForm;
