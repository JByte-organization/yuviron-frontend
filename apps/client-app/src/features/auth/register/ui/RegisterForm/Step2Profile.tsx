'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

const SelectArrow = () => (
    <span className="client-register-profile-form__select-arrow" aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
        </svg>
    </span>
);

const MONTHS = [
    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень',
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => CURRENT_YEAR - i);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export const Step2Profile = () => {
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        router.push('/login');
    };

    return (
        <div className="client-register-profile-form">
            <div className="client-register-profile-form__top">
                <Link href="/register/details" className="client-register-profile-form__back text-decoration-none">
                    Назад
                </Link>
            </div>

            <div className="client-register-profile-form__logo">
                <img src="/Logo.svg" alt="LumiTune" className="client-register-profile-form__logo-image" />
            </div>

            <h1 className="client-register-profile-form__title">Створіть профіль</h1>
            <div className="client-register-profile-form__step">Крок 2 із 2</div>

            <div className="client-register-profile-form__progress">
                <span className="client-register-profile-form__progress-fill" />
            </div>

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="displayName" className="form-label client-register-profile-form__label">
                        Ім’я
                    </label>
                    <input
                        id="displayName"
                        type="text"
                        className="form-control client-register-profile-form__input"
                    />
                    <div className="client-register-profile-form__hint">
                        Це ім’я бачитимуть на вашому профілі.
                    </div>
                </div>

                <div className="mb-3">
                    <div className="client-register-profile-form__label">Дата народження</div>
                    <a href="#" className="client-register-profile-form__hint-link d-block text-decoration-none">
                        Для чого нам потрібна ваша дата народження?
                    </a>
                    <div className="client-register-profile-form__date-row">
                        <div className="client-register-profile-form__select-wrap">
                            <select
                                aria-label="День"
                                className="form-select client-register-profile-form__select"
                                defaultValue=""
                            >
                                <option value="" disabled>День</option>
                                {DAYS.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                            <SelectArrow />
                        </div>

                        <div className="client-register-profile-form__select-wrap">
                            <select
                                aria-label="Місяць"
                                className="form-select client-register-profile-form__select"
                                defaultValue=""
                            >
                                <option value="" disabled>Місяць</option>
                                {MONTHS.map((m, i) => (
                                    <option key={m} value={i + 1}>{m}</option>
                                ))}
                            </select>
                            <SelectArrow />
                        </div>

                        <div className="client-register-profile-form__select-wrap">
                            <select
                                aria-label="Рік"
                                className="form-select client-register-profile-form__select"
                                defaultValue=""
                            >
                                <option value="" disabled>Рік</option>
                                {YEARS.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                            <SelectArrow />
                        </div>
                    </div>
                </div>

                <div className="mb-3">
                    <div className="client-register-profile-form__label">Регіон проживання</div>
                    <a href="#" className="client-register-profile-form__hint-link d-block text-decoration-none">
                        Для чого нам потрібно знати регіон та місто проживання?
                    </a>
                    <div className="client-register-profile-form__region-grid">
                        <div>
                            <label htmlFor="country" className="form-label client-register-profile-form__sub-label">
                                Країна
                            </label>
                            <div className="client-register-profile-form__select-wrap">
                                <select
                                    id="country"
                                    className="form-select client-register-profile-form__select"
                                    defaultValue=""
                                >
                                    <option value="" disabled>Оберіть</option>
                                    <option value="UA">Україна</option>
                                    <option value="PL">Польща</option>
                                    <option value="DE">Німеччина</option>
                                    <option value="US">США</option>
                                </select>
                                <SelectArrow />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="city" className="form-label client-register-profile-form__sub-label">
                                Місто
                            </label>
                            <div className="client-register-profile-form__select-wrap">
                                <select
                                    id="city"
                                    className="form-select client-register-profile-form__select"
                                    defaultValue=""
                                >
                                    <option value="" disabled>Оберіть</option>
                                    <option value="kyiv">Київ</option>
                                    <option value="lviv">Львів</option>
                                    <option value="odesa">Одеса</option>
                                    <option value="kharkiv">Харків</option>
                                </select>
                                <SelectArrow />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <div className="client-register-profile-form__label">Хто ви?</div>
                    <div className="client-register-profile-form__radio-list">
                        <label className="client-register-profile-form__radio">
                            <input type="radio" name="role" value="user" defaultChecked />
                            <span>Я звичайний користувач</span>
                        </label>
                        <label className="client-register-profile-form__radio">
                            <input type="radio" name="role" value="artist" />
                            <span>Я виконавець</span>
                        </label>
                    </div>
                </div>

                <button type="submit" className="btn client-register-profile-form__submit w-100">
                    Зареєструватися
                </button>
            </form>
        </div>
    );
};

export default Step2Profile;
