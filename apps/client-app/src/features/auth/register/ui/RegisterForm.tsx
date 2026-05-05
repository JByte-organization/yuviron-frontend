'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const RegisterForm = () => {
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        router.push('/register/details');
    };

    return (
        <form className="client-register-form" onSubmit={handleSubmit}>
            <div className="mb-4">
                <label htmlFor="email" className="form-label client-register-form__label">
                    Електронна пошта
                </label>
                <input
                    id="email"
                    type="email"
                    className="form-control client-register-form__input"
                    placeholder="@gmail.com"
                />
            </div>

            <button type="submit" className="btn client-register-form__submit w-100">
                Далі
            </button>

            <div className="client-register-form__divider">
                <span>або</span>
            </div>

            <div className="client-register-form__socials">
                <button type="button" className="client-register-form__social-btn">
                    <span className="client-register-form__social-icon client-register-form__social-icon--facebook">f</span>
                    <span>Увійти з Facebook</span>
                </button>

                <button type="button" className="client-register-form__social-btn">
                    <span className="client-register-form__social-icon client-register-form__social-icon--google">G</span>
                    <span>Увійти з Google</span>
                </button>

                <button type="button" className="client-register-form__social-btn">
                    <span className="client-register-form__social-icon client-register-form__social-icon--apple"></span>
                    <span>Увійти з Apple</span>
                </button>
            </div>

            <div className="client-register-form__bottom-divider" />

            <div className="client-register-form__login text-center">
                <span>Є акаунт?</span>
                <Link href="/login" className="client-register-form__login-link text-decoration-none">
                    Перейти до входу
                </Link>
            </div>
        </form>
    );
};

export default RegisterForm;