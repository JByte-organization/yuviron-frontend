'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) return 'Введіть електронну пошту';
    if (!EMAIL_REGEX.test(email.trim())) return 'Некоректний формат пошти';
    return undefined;
};

export const RegisterForm = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | undefined>();
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitted(true);
        const next = validateEmail(email);
        setError(next);
        if (next) return;
        router.push('/register/details');
    };

    return (
        <form className="client-register-form" onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
                <label htmlFor="email" className="form-label client-register-form__label">
                    Електронна пошта
                </label>
                <input
                    id="email"
                    type="email"
                    className={`form-control client-register-form__input${error ? ' is-invalid' : ''}`}
                    placeholder="@gmail.com"
                    value={email}
                    onChange={(event) => {
                        setEmail(event.target.value);
                        if (submitted) setError(validateEmail(event.target.value));
                    }}
                />
                {error && <div className="client-register-form__error">{error}</div>}
            </div>

            <button type="submit" className="btn client-register-form__submit w-100">
                Далі
            </button>

            <div className="client-register-form__divider">
                <span>або</span>
            </div>

            <div className="client-register-form__socials">
                <button type="button" className="client-register-form__social-btn">
                    <span className="client-register-form__social-icon client-register-form__social-icon--facebook">
                        f
                    </span>
                    <span>Увійти з Facebook</span>
                </button>

                <button type="button" className="client-register-form__social-btn">
                    <span className="client-register-form__social-icon client-register-form__social-icon--google">
                        G
                    </span>
                    <span>Увійти з Google</span>
                </button>

                <button type="button" className="client-register-form__social-btn">
                    <span className="client-register-form__social-icon client-register-form__social-icon--apple">

                    </span>
                    <span>Увійти з Apple</span>
                </button>
            </div>

            <div className="client-register-form__bottom-divider" />

            <div className="client-register-form__login text-center">
                <span>Є акаунт?</span>
                <Link href="/login" className="client-register-form__login-link text-decoration-none">
                    Увійти до акаунту
                </Link>
            </div>
        </form>
    );
};

export default RegisterForm;
