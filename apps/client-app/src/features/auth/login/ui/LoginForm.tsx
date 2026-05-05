'use client';

import Link from 'next/link';
import { type FormEvent, useState } from 'react';

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
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<LoginErrors>({});
    const [submitted, setSubmitted] = useState(false);

    const runValidation = (next: { identifier?: string; password?: string }) => {
        if (!submitted) return;
        setErrors(validate(next.identifier ?? identifier, next.password ?? password));
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitted(true);
        const nextErrors = validate(identifier, password);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;
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

            <button type="submit" className="btn client-login-form__submit w-100">
                Увійти
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
