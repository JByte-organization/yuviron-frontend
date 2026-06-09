'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { usePostApiAuthConfirmEmail } from '@repo/api/client.ts';

// Подтверждение почты при регистрации = link-based. Бэк шлёт письмо с кнопкой
// → /confirm-email?token=... Эта форма достаёт token из query и дёргает
// POST /api/auth/confirm-email { token }. 6-значный код тут НЕ при чём — это
// отдельный флоу входа без пароля (см. features/auth/login-with-code).
export const ConfirmEmailForm = () => {
    const searchParams = useSearchParams();
    const token = searchParams.get('token') ?? '';

    const { mutate, isPending, isSuccess, isError, error } = usePostApiAuthConfirmEmail();

    // Авто-подтверждение при заходе по ссылке. firedRef защищает от повторного
    // вызова в StrictMode/ре-рендерах.
    const firedRef = useRef(false);
    useEffect(() => {
        if (!token || firedRef.current) return;
        firedRef.current = true;
        mutate({ data: { token } });
    }, [token, mutate]);

    if (!token) {
        return (
            <div className="client-forgot-form">
                <div className="client-forgot-form__logo">
                    <img
                        src="/logo.svg"
                        alt="Yuviron"
                        className="client-forgot-form__logo-image"
                    />
                </div>
                <h1 className="client-forgot-form__title">Підтвердження Email</h1>
                <p className="client-forgot-form__subtitle">
                    Посилання недійсне: відсутній токен підтвердження.
                </p>
                <Link
                    href="/register"
                    className="btn client-forgot-form__submit w-100 text-decoration-none"
                >
                    На реєстрацію
                </Link>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="client-forgot-form">
                <div className="client-forgot-form__logo">
                    <img
                        src="/logo.svg"
                        alt="Yuviron"
                        className="client-forgot-form__logo-image"
                    />
                </div>
                <h1 className="client-forgot-form__title">Пошту підтверджено</h1>
                <p className="client-forgot-form__subtitle">
                    Дякуємо! Вашу електронну адресу підтверджено.
                    Тепер ви можете увійти до акаунту.
                </p>
                <Link
                    href="/login"
                    className="btn client-forgot-form__submit w-100 text-decoration-none"
                >
                    Увійти
                </Link>
            </div>
        );
    }

    if (isError) {
        const data = (error as any)?.response?.data;
        const message =
            data?.detail ||
            data?.title ||
            data?.message ||
            'Посилання недійсне або застаріле. Спробуйте зареєструватися ще раз.';
        return (
            <div className="client-forgot-form">
                <div className="client-forgot-form__logo">
                    <img
                        src="/logo.svg"
                        alt="Yuviron"
                        className="client-forgot-form__logo-image"
                    />
                </div>
                <h1 className="client-forgot-form__title">Не вдалося підтвердити</h1>
                <p className="client-forgot-form__subtitle">{message}</p>
                <Link
                    href="/register"
                    className="btn client-forgot-form__submit w-100 text-decoration-none"
                >
                    На реєстрацію
                </Link>
                <div className="client-forgot-form__login text-center">
                    <span>Вже маєте акаунт?</span>
                    <Link
                        href="/login"
                        className="client-forgot-form__login-link text-decoration-none"
                    >
                        Увійти
                    </Link>
                </div>
            </div>
        );
    }

    // idle / isPending
    return (
        <div className="client-forgot-form">
            <div className="client-forgot-form__logo">
                <img
                    src="/logo.svg"
                    alt="Yuviron"
                    className="client-forgot-form__logo-image"
                />
            </div>
            <h1 className="client-forgot-form__title">Підтвердження Email</h1>
            <p className="client-forgot-form__subtitle">
                {isPending ? 'Підтверджуємо вашу пошту…' : 'Зачекайте секунду…'}
            </p>
        </div>
    );
};

export default ConfirmEmailForm;
