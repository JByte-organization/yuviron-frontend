'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Экран после успешного register. Подтверждение почты идёт по ССЫЛКЕ из письма
// (/confirm-email?token=...), поэтому тут не вводят код — просто просим открыть
// письмо. Resend-эндпоинта для confirm у бэка нет, так что кнопки «надіслати
// ще раз» здесь нет (в отличие от входа по коду).
export const CheckEmailNotice = () => {
    const searchParams = useSearchParams();
    const email = searchParams.get('email') ?? '';

    return (
        <div className="client-forgot-form">
            <div className="client-forgot-form__logo">
                <img
                    src="/logo.svg"
                    alt="Yuviron"
                    className="client-forgot-form__logo-image"
                />
            </div>

            <h1 className="client-forgot-form__title">Перевірте пошту</h1>
            <p className="client-forgot-form__subtitle">
                Ми надіслали лист із підтвердженням
                {email ? (
                    <>
                        {' '}
                        на адресу <strong>{email}</strong>
                    </>
                ) : null}
                . Перейдіть за посиланням у листі, щоб активувати акаунт.
            </p>
            <p className="client-forgot-form__subtitle">
                Не бачите листа? Перевірте папку «Спам».
            </p>

            <Link
                href="/login"
                className="btn client-forgot-form__submit w-100 text-decoration-none"
            >
                Перейти до входу
            </Link>

            <div className="client-forgot-form__bottom-divider" />

            <div className="client-forgot-form__login text-center">
                <span>Будуть проблеми?</span>
                <Link
                    href="/login"
                    className="client-forgot-form__login-link text-decoration-none"
                >
                    Звернутися до експерта
                </Link>
            </div>
        </div>
    );
};

export default CheckEmailNotice;
