'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { getRegisterDraft, setRegisterDraft } from '../../model/registerDraft';

const checkUppercase = (value: string) => /[A-Z]/.test(value);
const checkLowercase = (value: string) => /[a-z]/.test(value);
const checkDigit = (value: string) => /\d/.test(value);
const checkLength = (value: string) => value.length >= 8;
const checkMaxLength = (value: string) => value.length <= 100;

export const Step1Details = () => {
    const router = useRouter();
    const [password, setPassword] = useState(() => getRegisterDraft().password ?? '');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const [submitted, setSubmitted] = useState(false);

    const hasUppercase = checkUppercase(password);
    const hasLowercase = checkLowercase(password);
    const hasDigit = checkDigit(password);
    const hasLength = checkLength(password);
    const withinMax = checkMaxLength(password);
    const isValid = hasUppercase && hasLowercase && hasDigit && hasLength && withinMax;

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitted(true);
        if (!isValid) {
            setError(
                withinMax
                    ? 'Пароль не відповідає правилам'
                    : 'Пароль не може бути довшим за 100 символів',
            );
            return;
        }
        setError(undefined);
        setRegisterDraft({ password });
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
                    src="/logo.svg"
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
                        <li className={hasUppercase ? 'is-valid' : undefined}>1 велику літеру</li>
                        <li className={hasLowercase ? 'is-valid' : undefined}>1 малу літеру</li>
                        <li className={hasDigit ? 'is-valid' : undefined}>1 цифру</li>
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
