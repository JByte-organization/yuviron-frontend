'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const VerifyCodeForm = () => {
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        router.push('/reset-password');
    };

    return (
        <div className="client-verify-form">
            <div className="client-verify-form__top">
                <Link href="/forgot-password" className="client-verify-form__back text-decoration-none">
                    Назад
                </Link>
            </div>

            <div className="client-verify-form__logo">
                <img src="/Logo.svg" alt="LumiTune" className="client-verify-form__logo-image" />
            </div>

            <h1 className="client-verify-form__title">Забули пароль?</h1>

            <div className="client-verify-form__subtitle">
                Введіть 6-значний код, який ми відправили
                <br />
                вам на адресу G*****2G*1.com
            </div>

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="code" className="form-label client-verify-form__label">
                        Код
                    </label>

                    <input
                        id="code"
                        type="text"
                        className="form-control client-verify-form__input"
                        placeholder="000-00"
                    />
                </div>

                <button type="submit" className="btn client-verify-form__submit w-100">
                    Продовжити
                </button>

                <div className="client-verify-form__divider">
                    <span>або</span>
                </div>

                <button type="button" className="btn client-verify-form__secondary w-100">
                    Отримайте новий код
                </button>

                <div className="client-verify-form__bottom text-center">
                    <span>Згадали пароль?</span>
                    <Link href="/login" className="client-verify-form__login-link text-decoration-none">
                        Зайдіть до акаунту
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default VerifyCodeForm;