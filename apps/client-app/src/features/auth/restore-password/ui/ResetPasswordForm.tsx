'use client';

import Link from 'next/link';
import { useState } from 'react';

export const ResetPasswordForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);

    return (
        <div className="client-reset-form">
            <div className="client-reset-form__top">
                <Link
                    href="/verify-code"
                    className="client-reset-form__back text-decoration-none"
                >
                    Назад
                </Link>
            </div>

            <div className="client-reset-form__logo">
                <img
                    src="/logo.svg"
                    alt="LumiTune"
                    className="client-reset-form__logo-image"
                />
            </div>

            <h1 className="client-reset-form__title">Придумайте новий пароль</h1>

            <form>
                <div className="mb-4">
                    <label
                        htmlFor="newPassword"
                        className="form-label client-reset-form__label"
                    >
                        Пароль
                    </label>

                    <div className="client-reset-form__password-wrap">
                        <input
                            id="newPassword"
                            type={showPassword ? 'text' : 'password'}
                            className="form-control client-reset-form__input client-reset-form__input--password"
                            placeholder="**************"
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
                </div>

                <div className="mb-4">
                    <label
                        htmlFor="repeatPassword"
                        className="form-label client-reset-form__label"
                    >
                        Повторіть пароль
                    </label>

                    <div className="client-reset-form__password-wrap">
                        <input
                            id="repeatPassword"
                            type={showRepeatPassword ? 'text' : 'password'}
                            className="form-control client-reset-form__input client-reset-form__input--password"
                            placeholder="**************"
                        />

                        <button
                            type="button"
                            className="client-reset-form__toggle"
                            onClick={() => setShowRepeatPassword((prev) => !prev)}
                            aria-label={showRepeatPassword ? 'Сховати пароль' : 'Показати пароль'}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </button>
                    </div>
                </div>

                <button type="submit" className="btn client-reset-form__submit w-100">
                    Змінити пароль
                </button>

                <div className="client-reset-form__divider">
                    <span>або</span>
                </div>

                <button
                    type="button"
                    className="btn client-reset-form__secondary w-100"
                >
                    Отримайте новий код
                </button>

                <div className="client-reset-form__bottom text-center">
                    <span>Згадали пароль?</span>
                    <Link
                        href="/login"
                        className="client-reset-form__login-link text-decoration-none"
                    >
                        Увійдіть до аккаунту
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default ResetPasswordForm;