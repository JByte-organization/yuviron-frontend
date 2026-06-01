'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { usePostApiAuthCheckEmail } from '@repo/api';
import { getRegisterDraft, setRegisterDraft } from '../model/registerDraft';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_TAKEN = 'Ця електронна пошта вже зареєстрована';

const validateEmail = (email: string): string | undefined => {
    const trimmed = email.trim();
    if (!trimmed) return 'Введіть електронну пошту';
    if (!EMAIL_REGEX.test(trimmed)) return 'Некоректний формат пошти';
    if (trimmed.length > 320) return 'Пошта не може бути довшою за 320 символів';
    return undefined;
};

export const RegisterForm = () => {
    const router = useRouter();
    const [email, setEmail] = useState(() => getRegisterDraft().email ?? '');
    const [error, setError] = useState<string | undefined>();
    const [submitted, setSubmitted] = useState(false);

    const { mutateAsync: checkEmail, isPending: isChecking } = usePostApiAuthCheckEmail();

    // Спрашивает у бэка, занята ли почта. Возвращает true, если занята.
    // Сетевую ошибку не считаем «занято» — пропускаем дальше, финальный
    // register всё равно отловит дубль.
    const isEmailTaken = async (value: string): Promise<boolean> => {
        try {
            const res = (await checkEmail({ data: { email: value } })) as any;
            return Boolean(res?.exists ?? res?.data?.exists);
        } catch {
            return false;
        }
    };

    // Проверяем занятость сразу при уходе из поля — чтобы пользователь узнал
    // о занятой почте здесь, а не после заполнения имени/страны на шаге 2.
    const handleBlur = async () => {
        const formatError = validateEmail(email);
        if (formatError) return;
        if (await isEmailTaken(email.trim())) setError(EMAIL_TAKEN);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitted(true);
        const next = validateEmail(email);
        setError(next);
        if (next) return;
        if (await isEmailTaken(email.trim())) {
            setError(EMAIL_TAKEN);
            return;
        }
        setRegisterDraft({ email: email.trim() });
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
                        // Сбрасываем ошибку «почта занята» при правке; формат
                        // переоцениваем только после первой попытки сабмита.
                        setError(submitted ? validateEmail(event.target.value) : undefined);
                    }}
                    onBlur={handleBlur}
                />
                {error && <div className="client-register-form__error">{error}</div>}
            </div>

            <button
                type="submit"
                className="btn client-register-form__submit w-100"
                disabled={isChecking}
            >
                {isChecking ? 'Перевірка…' : 'Далі'}
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
