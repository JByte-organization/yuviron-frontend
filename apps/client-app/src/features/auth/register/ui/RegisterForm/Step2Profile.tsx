'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { usePostApiAuthRegister, postApiAuthLogin } from '@repo/api';
import { Gender } from '@repo/api/generated/client/models/gender';
import { useSessionStore } from '@/entities/session/model/store';
import {
    clearRegisterDraft,
    getRegisterDraft,
    setRegisterDraft,
} from '../../model/registerDraft';

type ProfileErrors = {
    name?: string;
    day?: string;
    month?: string;
    year?: string;
    country?: string;
    city?: string;
    role?: string;
};

const MONTHS = [
    'Січень',
    'Лютий',
    'Березень',
    'Квітень',
    'Травень',
    'Червень',
    'Липень',
    'Серпень',
    'Вересень',
    'Жовтень',
    'Листопад',
    'Грудень',
];

// Бэк хранит код страны в короткой колонке (VARCHAR(2-3)) и ждёт ISO 3166-1 alpha-2.
const COUNTRIES: ReadonlyArray<{ code: string; label: string }> = [
    { code: 'UA', label: 'Україна' },
    { code: 'PL', label: 'Польща' },
    { code: 'DE', label: 'Німеччина' },
];
const CITIES = ['Київ', 'Львів', 'Одеса'];

const CURRENT_YEAR = new Date().getFullYear();
const MIN_AGE_YEARS = 16;

type ProfileState = {
    name: string;
    day: string;
    month: string;
    year: string;
    country: string;
    city: string;
    role: string;
};

const isAtLeastMinAge = (year: number, month: number, day: number): boolean => {
    const dob = new Date(Date.UTC(year, month - 1, day));
    const today = new Date();
    const cutoff = new Date(
        Date.UTC(today.getUTCFullYear() - MIN_AGE_YEARS, today.getUTCMonth(), today.getUTCDate()),
    );
    return dob.getTime() <= cutoff.getTime();
};

const validate = (state: ProfileState): ProfileErrors => {
    const errors: ProfileErrors = {};

    if (!state.name.trim()) errors.name = 'Введіть ім’я';
    else if (state.name.trim().length > 50) errors.name = 'Ім’я не може бути довшим за 50 символів';

    const day = Number(state.day);
    if (!state.day) errors.day = '—';
    else if (!Number.isInteger(day) || day < 1 || day > 31) errors.day = 'День 1–31';

    const month = Number(state.month);
    if (!state.month) errors.month = '—';

    const year = Number(state.year);
    if (!state.year) errors.year = '—';
    else if (!Number.isInteger(year) || year < 1900 || year > CURRENT_YEAR) {
        errors.year = `Рік 1900–${CURRENT_YEAR}`;
    }

    if (!errors.day && !errors.month && !errors.year) {
        if (!isAtLeastMinAge(year, month, day)) {
            errors.year = `Реєстрація доступна з ${MIN_AGE_YEARS} років`;
        }
    }

    if (!state.country) errors.country = 'Оберіть країну';
    if (!state.city) errors.city = 'Оберіть місто';
    if (!state.role) errors.role = 'Оберіть роль';

    return errors;
};

export const Step2Profile = () => {
    const router = useRouter();
    const setAccessToken = useSessionStore((s) => s.setAccessToken);
    const [state, setState] = useState<ProfileState>(() => {
        const draft = getRegisterDraft();
        // Защита от старых черновиков, где country хранился как полное название
        // ("Україна") до того, как мы перешли на ISO-коды ("UA"). Если значение
        // не входит в текущий список — сбрасываем, иначе селект выглядит
        // заполненным, а на бэк уезжает мусор.
        const draftCountry = draft.country ?? '';
        const country = COUNTRIES.some((c) => c.code === draftCountry) ? draftCountry : '';
        const draftCity = draft.city ?? '';
        const city = CITIES.includes(draftCity) ? draftCity : '';
        return {
            name: draft.firstName ?? '',
            day: draft.day ?? '',
            month: draft.month ?? '',
            year: draft.year ?? '',
            country,
            city,
            role: draft.role ?? '',
        };
    });
    const [errors, setErrors] = useState<ProfileErrors>({});
    const [submitted, setSubmitted] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const update = <K extends keyof ProfileState>(key: K, value: ProfileState[K]) => {
        const next = { ...state, [key]: value };
        setState(next);
        if (submitted) setErrors(validate(next));
    };

    const { mutate, isPending } = usePostApiAuthRegister({
        mutation: {
            onSuccess: async (_response, variables) => {
                const { email, password, isArtist } = variables.data;
                clearRegisterDraft();
                const next = isArtist ? '/artist-onboarding' : '/';
                try {
                    const loginRes: any = await postApiAuthLogin({ email, password });
                    const token = loginRes?.data?.token ?? loginRes?.token;
                    if (token) {
                        setAccessToken(token);
                        router.push(next);
                    } else {
                        router.push('/login');
                    }
                } catch {
                    router.push('/login');
                }
            },
            onError: (error: any) => {
                console.log('[register] status:', error?.response?.status);
                console.log('[register] data:', JSON.stringify(error?.response?.data, null, 2));
                const data = error?.response?.data;
                const fieldErrors = data?.errors
                    ? Object.values(data.errors).flat().join(' ')
                    : null;
                const message =
                    fieldErrors ||
                    data?.detail ||
                    data?.title ||
                    data?.message ||
                    data?.error ||
                    (typeof data === 'string' ? data : null) ||
                    'Не вдалося зареєструватися. Спробуйте ще раз.';
                setServerError(message);
            },
        },
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitted(true);
        setServerError(null);
        const next = validate(state);
        setErrors(next);
        if (Object.keys(next).length > 0) return;

        setRegisterDraft({
            firstName: state.name,
            day: state.day,
            month: state.month,
            year: state.year,
            country: state.country,
            city: state.city,
            role: state.role as 'listener' | 'author',
        });

        const draft = getRegisterDraft();
        if (!draft.email || !draft.password) {
            router.push('/register');
            return;
        }

        const dateOfBirth = new Date(
            Date.UTC(
                Number(state.year),
                Number(state.month) - 1,
                Number(state.day),
            ),
        ).toISOString();
        const isArtist = state.role === 'author';

        mutate({
            data: {
                email: draft.email,
                password: draft.password,
                firstName: state.name.trim(),
                country: state.country,
                city: state.city,
                dateOfBirth,
                gender: Gender.NotSpecified,
                acceptMarketing: false,
                acceptTerms: true,
                isArtist,
            },
        });
    };

    const dateInvalid = errors.day || errors.month || errors.year;

    return (
        <div className="client-register-profile-form">
            <div className="client-register-profile-form__top">
                <Link
                    href="/register/details"
                    className="client-register-profile-form__back text-decoration-none"
                >
                    Назад
                </Link>
            </div>

            <div className="client-register-profile-form__logo">
                <img
                    src="/logo.svg"
                    alt="LumiTune"
                    className="client-register-profile-form__logo-image"
                />
            </div>

            <h1 className="client-register-profile-form__title">Створіть профіль</h1>
            <div className="client-register-profile-form__step">Крок 2 із 2</div>

            <div className="client-register-profile-form__progress">
                <span className="client-register-profile-form__progress-fill" />
            </div>

            <form onSubmit={handleSubmit} noValidate>
                <div className="mb-4">
                    <label
                        htmlFor="profileName"
                        className="form-label client-register-profile-form__label"
                    >
                        Ім&apos;я
                    </label>
                    <div className="client-register-profile-form__hint">
                        Це ім&apos;я відображатиметься в профілі
                    </div>
                    <input
                        id="profileName"
                        type="text"
                        className={`form-control client-register-profile-form__input${errors.name ? ' is-invalid' : ''}`}
                        placeholder="Ім'я"
                        value={state.name}
                        onChange={(event) => update('name', event.target.value)}
                    />
                    {errors.name && (
                        <div className="client-register-profile-form__error">{errors.name}</div>
                    )}
                </div>

                <div className="mb-4">
                    <label className="form-label client-register-profile-form__label">
                        Дата народження
                    </label>
                    <div className="client-register-profile-form__hint">
                        Для чого нам потрібна ваша дата народження?
                    </div>
                    <div className="client-register-profile-form__hint-link">Докладніше</div>

                    <div className="client-register-profile-form__date-row">
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={2}
                            className={`form-control client-register-profile-form__input${errors.day ? ' is-invalid' : ''}`}
                            placeholder="дд"
                            value={state.day}
                            onChange={(event) =>
                                update('day', event.target.value.replace(/\D/g, ''))
                            }
                        />

                        <div className="client-register-profile-form__select-wrap">
                            <select
                                className={`form-select client-register-profile-form__select${errors.month ? ' is-invalid' : ''}`}
                                value={state.month}
                                onChange={(event) => update('month', event.target.value)}
                            >
                                <option value="">Місяць</option>
                                {MONTHS.map((month, idx) => (
                                    <option key={month} value={String(idx + 1)}>
                                        {month}
                                    </option>
                                ))}
                            </select>
                            <span className="client-register-profile-form__select-arrow" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="m6 9 6 6 6-6" />
                                </svg>
                            </span>
                        </div>

                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={4}
                            className={`form-control client-register-profile-form__input${errors.year ? ' is-invalid' : ''}`}
                            placeholder="рррр"
                            value={state.year}
                            onChange={(event) =>
                                update('year', event.target.value.replace(/\D/g, ''))
                            }
                        />
                    </div>
                    {dateInvalid && (
                        <div className="client-register-profile-form__error">
                            {errors.year ?? errors.day ?? 'Оберіть дату народження'}
                        </div>
                    )}
                </div>

                <div className="mb-4">
                    <label className="form-label client-register-profile-form__label">
                        Регіон проживання
                    </label>
                    <div className="client-register-profile-form__hint">
                        Для чого нам потрібне ваше місце проживання?
                    </div>
                    <div className="client-register-profile-form__hint-link">Докладніше</div>

                    <div className="client-register-profile-form__region-grid">
                        <div>
                            <label className="form-label client-register-profile-form__sub-label">
                                Країна
                            </label>
                            <div className="client-register-profile-form__select-wrap">
                                <select
                                    className={`form-select client-register-profile-form__select${errors.country ? ' is-invalid' : ''}`}
                                    value={state.country}
                                    onChange={(event) => update('country', event.target.value)}
                                >
                                    <option value="">Країна</option>
                                    {COUNTRIES.map(({ code, label }) => (
                                        <option key={code} value={code}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                                <span className="client-register-profile-form__select-arrow" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="m6 9 6 6 6-6" />
                                    </svg>
                                </span>
                            </div>
                            {errors.country && (
                                <div className="client-register-profile-form__error">{errors.country}</div>
                            )}
                        </div>

                        <div>
                            <label className="form-label client-register-profile-form__sub-label">
                                Місто
                            </label>
                            <div className="client-register-profile-form__select-wrap">
                                <select
                                    className={`form-select client-register-profile-form__select${errors.city ? ' is-invalid' : ''}`}
                                    value={state.city}
                                    onChange={(event) => update('city', event.target.value)}
                                >
                                    <option value="">Місто</option>
                                    {CITIES.map((city) => (
                                        <option key={city} value={city}>
                                            {city}
                                        </option>
                                    ))}
                                </select>
                                <span className="client-register-profile-form__select-arrow" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="m6 9 6 6 6-6" />
                                    </svg>
                                </span>
                            </div>
                            {errors.city && (
                                <div className="client-register-profile-form__error">{errors.city}</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <div className="client-register-profile-form__label">Хто ви?</div>

                    <div className="client-register-profile-form__radio-list">
                        <label className="client-register-profile-form__radio">
                            <input
                                type="radio"
                                name="role"
                                value="listener"
                                checked={state.role === 'listener'}
                                onChange={(event) => update('role', event.target.value)}
                            />
                            <span>Я звичайний користувач</span>
                        </label>

                        <label className="client-register-profile-form__radio">
                            <input
                                type="radio"
                                name="role"
                                value="author"
                                checked={state.role === 'author'}
                                onChange={(event) => update('role', event.target.value)}
                            />
                            <span>Я автор пісень</span>
                        </label>
                    </div>
                    {errors.role && (
                        <div className="client-register-profile-form__error">{errors.role}</div>
                    )}
                </div>

                {serverError && (
                    <div className="client-register-profile-form__error mb-3">{serverError}</div>
                )}

                <button
                    type="submit"
                    className="btn client-register-profile-form__submit w-100"
                    disabled={isPending}
                >
                    {isPending ? 'Реєстрація…' : 'Зареєструватися'}
                </button>
            </form>
        </div>
    );
};

export default Step2Profile;
