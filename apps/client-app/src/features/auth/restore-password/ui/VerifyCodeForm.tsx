'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';

const CODE_REGEX = /^\d{6}$/;

const validateCode = (code: string): string | undefined => {
    if (!code) return 'Введіть код';
    if (!CODE_REGEX.test(code)) return 'Код має містити 6 цифр';
    return undefined;
};

export const VerifyCodeForm = () => {
    const router = useRouter();
    const [code, setCode] = useState('');
    const [error, setError] = useState<string | undefined>();
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitted(true);
        const next = validateCode(code);
        setError(next);
        if (next) return;
        router.push('/reset-password');
    };

    return (
        <div className="client-forgot-form">
            <div className="client-forgot-form__top">
                <Link
                    href="/forgot-password"
                    className="client-forgot-form__back text-decoration-none"
                >
                    Назад
                </Link>
            </div>

            <div className="client-forgot-form__logo">
                <img
                    src="/Logo.svg"
                    alt="LumiTune"
                    className="client-forgot-form__logo-image"
                />
            </div>

            <h1 className="client-forgot-form__title">Забули пароль?</h1>
            <p className="client-forgot-form__subtitle">
                Введіть 6-значний код, який ми надіслали
                <br />
                вам на адресу G******3@G*.com
            </p>

            <form onSubmit={handleSubmit} noValidate>
                <div className="mb-4">
                    <label htmlFor="code" className="form-label client-forgot-form__label">
                        Код
                    </label>
                    <input
                        id="code"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        className={`form-control client-forgot-form__input${error ? ' is-invalid' : ''}`}
                        placeholder="000000"
                        value={code}
                        onChange={(event) => {
                            const next = event.target.value.replace(/\D/g, '');
                            setCode(next);
                            if (submitted) setError(validateCode(next));
                        }}
                    />
                    {error && <div className="client-forgot-form__error">{error}</div>}
                </div>

                <button type="submit" className="btn client-forgot-form__submit w-100">
                    Продовжити
                </button>
            </form>

            <div className="client-forgot-form__bottom-divider" />

            <button type="button" className="btn client-forgot-form__resend w-100">
                Надіслати новий код
            </button>

            <div className="client-forgot-form__login text-center">
                <span>Будуть проблеми?</span>
                <Link href="/login" className="client-forgot-form__login-link text-decoration-none">
                    Звернутися до експерта
                </Link>
            </div>
        </div>
    );
};

export default VerifyCodeForm;
