'use client';

import { type FormEvent, useState } from 'react';
import Link from 'next/link';
import { CoverUpload } from '@/shared/ui/CoverUpload';
import { useCreateArtistProfile } from '../model/useCreateArtistProfile';

// Путь 2: создание нового артист-профиля (имя + опциональный аватар).
export const CreateArtistForm = () => {
    const { status, error, submit, isSubmitting } = useCreateArtistProfile();
    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState<File | null>(null);
    const [nameError, setNameError] = useState<string>();

    if (status === 'success') {
        return (
            <div className="client-become-artist__result">
                <div className="client-become-artist__result-icon client-become-artist__result-icon--ok">
                    <i className="bi bi-check-lg" />
                </div>
                <h2 className="client-become-artist__result-title">Профіль артиста створено</h2>
                <p className="client-become-artist__result-text">
                    Тепер ви можете завантажувати музику та керувати своїм профілем.
                </p>
                <Link
                    href="/artist-dashboard"
                    className="client-become-artist__btn client-become-artist__btn--primary"
                >
                    Перейти до кабінету артиста
                </Link>
            </div>
        );
    }

    if (status === 'limit') {
        return (
            <div className="client-become-artist__result">
                <div className="client-become-artist__result-icon client-become-artist__result-icon--star">
                    <i className="bi bi-star-fill" />
                </div>
                <h2 className="client-become-artist__result-title">Досягнуто ліміту профілів</h2>
                <p className="client-become-artist__result-text">
                    На безкоштовному тарифі доступний один профіль артиста. Оформіть Premium, щоб
                    створити більше.
                </p>
                <Link href="/premium" className="client-become-artist__btn client-become-artist__btn--primary">
                    Перейти на Premium
                </Link>
            </div>
        );
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) {
            setNameError('Введіть ім’я артиста');
            return;
        }
        if (trimmed.length > 100) {
            setNameError('Ім’я не може бути довшим за 100 символів');
            return;
        }
        setNameError(undefined);
        submit(trimmed, avatar);
    };

    return (
        <form className="client-become-artist__form" onSubmit={handleSubmit} noValidate>
            <div className="client-become-artist__avatar">
                <CoverUpload value={avatar} onChange={setAvatar} />
                <span className="client-become-artist__avatar-hint">Аватар (необов’язково)</span>
            </div>

            <div className="client-become-artist__field">
                <label htmlFor="artistName" className="client-become-artist__label">
                    Ім’я артиста
                </label>
                <input
                    id="artistName"
                    type="text"
                    className={`client-become-artist__input${nameError ? ' is-invalid' : ''}`}
                    value={name}
                    placeholder="Напр. Lana Del Rey"
                    disabled={isSubmitting}
                    onChange={(event) => {
                        setName(event.target.value);
                        if (nameError) setNameError(undefined);
                    }}
                />
                {nameError && <div className="client-become-artist__error">{nameError}</div>}
            </div>

            {error && <div className="client-become-artist__error mb-2">{error}</div>}

            <button
                type="submit"
                className="client-become-artist__btn client-become-artist__btn--primary w-100"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Створення…' : 'Створити профіль'}
            </button>
        </form>
    );
};

export default CreateArtistForm;
