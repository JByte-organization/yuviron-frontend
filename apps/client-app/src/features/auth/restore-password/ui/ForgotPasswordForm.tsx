'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const ForgotPasswordForm = () => {
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        router.push('/verify-code');
    };

    return (
        <div className="client-forgot-form">
            <div className="client-forgot-form__top">
                <Link href="/login" className="client-forgot-form__back text-decoration-none">
                    Назад
                </Link>
            </div>

            <div className="client-forgot-form__logo">
                <img src="/Logo.svg" alt="LumiTune" className="client-forgot-form__logo-image" />
            </div>

            <h1 className="client-forgot-form__title">Забули пароль?</h1>

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="email" className="form-label client-forgot-form__label">
                        Електронна пошта
                    </label>

                    <input
                        id="email"
                        type="email"
                        className="form-control client-forgot-form__input"
                        placeholder="@gmail.com"
                    />
                </div>

                <button type="submit" className="btn client-forgot-form__submit w-100">
                    Продовжити
                </button>

                <div className="client-forgot-form__divider">
                    <span>або</span>
                </div>

                <div className="client-forgot-form__bottom text-center">
                    <span>Згадали пароль?</span>
                    <Link href="/login" className="client-forgot-form__login-link text-decoration-none">
                        Увійдіть до аккаунту
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default ForgotPasswordForm;