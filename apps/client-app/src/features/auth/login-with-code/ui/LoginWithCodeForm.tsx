'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { type FormEvent, useMemo, useState } from 'react';
import { usePostApiAuthLoginWithCode, usePostApiAuthSendCode } from '@repo/api';
import { useSessionStore } from '@/entities/session/model/store';
import { clearRegisterDraft } from '@/features/auth/register/model/registerDraft';

const CODE_REGEX = /^\d{6}$/;

const validateCode = (code: string): string | undefined => {
    if (!code) return 'Введіть код';
    if (!CODE_REGEX.test(code)) return 'Код має містити 6 цифр';
    return undefined;
};

// G******3@G*.com — оставляем первую букву, последний символ локала и первую букву домена.
const maskEmail = (email: string): string => {
    const at = email.indexOf('@');
    if (at < 1) return email;
    const local = email.slice(0, at);
    const domain = email.slice(at + 1);
    const dot = domain.indexOf('.');
    const domainHead = dot > 0 ? domain.slice(0, dot) : domain;
    const tld = dot > 0 ? domain.slice(dot) : '';
    const maskedLocal =
        local.length <= 2
            ? `${local[0] ?? ''}*`
            : `${local[0]}${'*'.repeat(Math.max(local.length - 2, 1))}${local[local.length - 1]}`;
    const maskedDomain = `${domainHead[0] ?? ''}*${tld}`;
    return `${maskedLocal}@${maskedDomain}`;
};

export const LoginWithCodeForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') ?? '';
    const setAccessToken = useSessionStore((s) => s.setAccessToken);

    const [code, setCode] = useState('');
    const [error, setError] = useState<string | undefined>();
    const [submitted, setSubmitted] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [resendInfo, setResendInfo] = useState<string | null>(null);

    const maskedEmail = useMemo(() => (email ? maskEmail(email) : ''), [email]);

    // Вход по коду (passwordless login). login-with-code верифицирует код и
    // логинит: возвращает тот же payload, что обычный login
    // ({ token, userId, email, permissions }) плюс ставит refresh-куку.
    // Подтверждение email при регистрации идёт ОТДЕЛЬНО, по ссылке (/confirm-email).
    const { mutate, isPending } = usePostApiAuthLoginWithCode({
        mutation: {
            onSuccess: (res: any) => {
                const token = res?.token ?? res?.data?.token;
                clearRegisterDraft();
                if (token) {
                    setAccessToken(token);
                    router.push('/');
                } else {
                    router.push('/login');
                }
            },
            onError: (err: any) => {
                const data = err?.response?.data;
                const fieldErrors = data?.errors
                    ? Object.values(data.errors).flat().join(' ')
                    : null;
                setServerError(
                    fieldErrors ||
                        data?.detail ||
                        data?.title ||
                        data?.message ||
                        'Невірний або застарілий код. Спробуйте ще раз або надішліть новий.',
                );
            },
        },
    });

    const { mutate: resend, isPending: isResending } = usePostApiAuthSendCode({
        mutation: {
            onSuccess: () => {
                setServerError(null);
                setResendInfo('Новий код надіслано на вашу пошту.');
            },
            onError: (err: any) => {
                const data = err?.response?.data;
                setServerError(
                    data?.detail ||
                        data?.title ||
                        data?.message ||
                        'Не вдалося надіслати код. Спробуйте ще раз.',
                );
            },
        },
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitted(true);
        setServerError(null);
        setResendInfo(null);
        const next = validateCode(code);
        setError(next);
        if (next) return;
        if (!email) {
            setServerError('Втрачено контекст входу. Почніть спочатку.');
            return;
        }
        mutate({ data: { email, code } });
    };

    const handleResend = () => {
        if (!email || isResending || isPending) return;
        setResendInfo(null);
        setServerError(null);
        resend({ data: { email } });
    };

    if (!email) {
        return (
            <div className="client-forgot-form">
                <div className="client-forgot-form__logo">
                    <img
                        src="/logo.svg"
                        alt="Yuviron"
                        className="client-forgot-form__logo-image"
                    />
                </div>
                <h1 className="client-forgot-form__title">Вхід за кодом</h1>
                <p className="client-forgot-form__subtitle">
                    Втрачено контекст входу. Почніть спочатку.
                </p>
                <Link
                    href="/login"
                    className="btn client-forgot-form__submit w-100 text-decoration-none"
                >
                    На вхід
                </Link>
            </div>
        );
    }

    return (
        <div className="client-forgot-form">
            <div className="client-forgot-form__top">
                <Link
                    href="/login"
                    className="client-forgot-form__back text-decoration-none"
                >
                    Назад
                </Link>
            </div>

            <div className="client-forgot-form__logo">
                <img
                    src="/logo.svg"
                    alt="Yuviron"
                    className="client-forgot-form__logo-image"
                />
            </div>

            <h1 className="client-forgot-form__title">Вхід за кодом</h1>
            <p className="client-forgot-form__subtitle">
                Введіть 6-значний код, який ми надіслали
                <br />
                вам на адресу {maskedEmail}
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
                        autoComplete="one-time-code"
                        className={`form-control client-forgot-form__input${error ? ' is-invalid' : ''}`}
                        placeholder="000000"
                        value={code}
                        onChange={(event) => {
                            const next = event.target.value.replace(/\D/g, '');
                            setCode(next);
                            if (submitted) setError(validateCode(next));
                        }}
                        disabled={isPending}
                    />
                    {error && <div className="client-forgot-form__error">{error}</div>}
                </div>

                {serverError && (
                    <div className="client-forgot-form__error mb-3">{serverError}</div>
                )}
                {resendInfo && (
                    <div className="client-forgot-form__subtitle mb-3">{resendInfo}</div>
                )}

                <button
                    type="submit"
                    className="btn client-forgot-form__submit w-100"
                    disabled={isPending}
                >
                    {isPending ? 'Перевірка…' : 'Увійти'}
                </button>
            </form>

            <div className="client-forgot-form__bottom-divider" />

            <button
                type="button"
                className="btn client-forgot-form__resend w-100"
                onClick={handleResend}
                disabled={isResending || isPending}
            >
                {isResending ? 'Надсилання…' : 'Надіслати новий код'}
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

export default LoginWithCodeForm;
