'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export const Step1Details = () => {
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        router.push('/register/profile');
    };

    return (
        <div className="client-register-details-form">
            <div className="client-register-details-form__top">
                <Link href="/register" className="client-register-details-form__back text-decoration-none">
                    Назад
                </Link>
            </div>

            <div className="client-register-details-form__logo">
                <img src="/Logo.svg" alt="LumiTune" className="client-register-details-form__logo-image" />
            </div>

            <h1 className="client-register-details-form__title">Створіть профіль</h1>
            <div className="client-register-details-form__step">Крок 1 із 2</div>

            <div className="client-register-details-form__progress">
                <span className="client-register-details-form__progress-fill" />
            </div>

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="password" className="form-label client-register-details-form__label">
                        Пароль
                    </label>

                    <div className="client-register-details-form__password-wrap">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            className="form-control client-register-details-form__input client-register-details-form__input--password"
                            placeholder="****************"
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
                </div>

                <div className="client-register-details-form__rules">
                    <div className="client-register-details-form__rules-title">
                        Пароль має містити принаймні:
                    </div>

                    <ul className="client-register-details-form__rules-list">
                        <li>1 літеру</li>
                        <li>1 число або 1 спеціальний символ (наприклад, !7&#38;#)</li>
                        <li>8 символів</li>
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