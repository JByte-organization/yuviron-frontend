'use client';

import Link from 'next/link';

export const Step2Profile = () => {
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
                    src="/Logo.svg"
                    alt="LumiTune"
                    className="client-register-profile-form__logo-image"
                />
            </div>

            <h1 className="client-register-profile-form__title">Створіть профіль</h1>
            <div className="client-register-profile-form__step">Крок 2 із 2</div>

            <div className="client-register-profile-form__progress">
                <span className="client-register-profile-form__progress-fill" />
            </div>

            <form>
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
                        className="form-control client-register-profile-form__input"
                        placeholder="Ім'я"
                    />
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
                            className="form-control client-register-profile-form__input"
                            placeholder="рррр"
                        />

                        <div className="client-register-profile-form__select-wrap">
                            <select className="form-select client-register-profile-form__select">
                                <option value="">Місяць</option>
                                <option>Січень</option>
                                <option>Лютий</option>
                                <option>Березень</option>
                                <option>Квітень</option>
                                <option>Травень</option>
                                <option>Червень</option>
                                <option>Липень</option>
                                <option>Серпень</option>
                                <option>Вересень</option>
                                <option>Жовтень</option>
                                <option>Листопад</option>
                                <option>Грудень</option>
                            </select>
                            <span className="client-register-profile-form__select-arrow" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="m6 9 6 6 6-6" />
                                </svg>
                            </span>
                        </div>

                        <input
                            type="text"
                            className="form-control client-register-profile-form__input"
                            placeholder="рррр"
                        />
                    </div>
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
                                <select className="form-select client-register-profile-form__select">
                                    <option value="">Країна</option>
                                    <option>Україна</option>
                                    <option>Польща</option>
                                    <option>Німеччина</option>
                                </select>
                                <span className="client-register-profile-form__select-arrow" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="m6 9 6 6 6-6" />
                                    </svg>
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="form-label client-register-profile-form__sub-label">
                                Місто
                            </label>
                            <div className="client-register-profile-form__select-wrap">
                                <select className="form-select client-register-profile-form__select">
                                    <option value="">Місто</option>
                                    <option>Київ</option>
                                    <option>Львів</option>
                                    <option>Одеса</option>
                                </select>
                                <span className="client-register-profile-form__select-arrow" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="m6 9 6 6 6-6" />
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <div className="client-register-profile-form__label">Хто ви?</div>

                    <div className="client-register-profile-form__radio-list">
                        <label className="client-register-profile-form__radio">
                            <input type="radio" name="role" value="listener" />
                            <span>Я звичайний користувач</span>
                        </label>

                        <label className="client-register-profile-form__radio">
                            <input type="radio" name="role" value="author" />
                            <span>Я автор пісень</span>
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