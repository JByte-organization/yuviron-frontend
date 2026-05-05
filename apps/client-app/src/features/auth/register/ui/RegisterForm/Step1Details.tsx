'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';

const checkLetter = (value: string) => /[A-Za-zА-Яа-яЇїІіЄєҐґ]/.test(value);
const checkNumberOrSymbol = (value: string) => /[\d!@#$%^&*()_+\-={}[\]:;"'<>,.?/\\|`~]/.test(value);
const checkLength = (value: string) => value.length >= 8;

export const Step1Details = () => {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const [submitted, setSubmitted] = useState(false);

    const hasLetter = checkLetter(password);
    const hasNumberOrSymbol = checkNumberOrSymbol(password);
    const hasLength = checkLength(password);
    const isValid = hasLetter && hasNumberOrSymbol && hasLength;

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitted(true);
        if (!isValid) {
            setError('Пароль не відповідає правилам');
            return;
        }
        setError(undefined);
        router.push('/register/profile');
    };

    return (
        <div className="client-register-details-form">
            <div className="client-register-details-form__top">
                <Link
                    href="/register"
                    className="client-register-details-form__back text-decoration-none"
                >
                    Назад
                </Link>
            </div>

            <div className="client-register-details-form__logo">
                <img
                    src="/Logo.svg"
                    alt="LumiTune"
                    className="client-register-details-form__logo-image"
                />
            </div>

            <h1 className="client-register-details-form__title">Створіть профіль</h1>
            <div className="client-register-details-form__step">Крок 1 із 2</div>

            <div className="client-register-details-form__progress">
                <span className="client-register-details-form__progress-fill" />
            </div>

            <form onSubmit={handleSubmit} noValidate>
                <div className="mb-4">
                    <label
                        htmlFor="password"
                        className="form-label client-register-details-form__label"
                    >
                        Пароль
                    </label>

                    <div className="client-register-details-form__password-wrap">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            className={`form-control client-register-details-form__input client-register-details-form__input--password${submitted && !isValid ? ' is-invalid' : ''}`}
                            placeholder="****************"
                            value={password}
                            onChange={(event) => {
                                setPassword(event.target.value);
                                if (submitted) setError(undefined);
                            }}
                        />

                        <button
                            type="button"
                            className="client-register-details-form__toggle"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={showPassword ? 'Сховати пароль' : 'Показати пароль'}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </button>
                    </div>
                    {error && (
                        <div className="client-register-details-form__error">{error}</div>
                    )}
                </div>

                <div className="client-register-details-form__rules">
                    <div className="client-register-details-form__rules-title">
                        Пароль має містити принаймні:
                    </div>

                    <ul className="client-register-details-form__rules-list">
                        <li className={hasLetter ? 'is-valid' : undefined}>1 літеру</li>
                        <li className={hasNumberOrSymbol ? 'is-valid' : undefined}>
                            1 число або 1 спеціальний символ (наприклад, !?&#)
                        </li>
                        <li className={hasLength ? 'is-valid' : undefined}>8 символів</li>
                    </ul>
                </div>

                <button type="submit" className="btn client-register-details-form__submit w-100">
                    Далі
                </button>
            </form>
        </div>
    );
};

export default Step1Details;
