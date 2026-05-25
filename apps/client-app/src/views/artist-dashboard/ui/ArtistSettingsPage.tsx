'use client';

import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

type FormValues = {
    stageName: string;
    bio: string;
    country: string;
};

const MOCK_ARTIST = {
    stageName:  'МузикаВітч',
    bio:        'Вітаю всіх! Дякую, що завітали на мою сторінку.',
    country:    'Україна',
    avatarUrl:  'https://picsum.photos/id/91/200/200',
    bannerUrl:  null as string | null,
};

export const ArtistSettingsPage = () => {
    const {
        register, handleSubmit, formState: { errors, isSubmitting, isDirty },
    } = useForm<FormValues>({
        defaultValues: {
            stageName: MOCK_ARTIST.stageName,
            bio:       MOCK_ARTIST.bio,
            country:   MOCK_ARTIST.country,
        },
    });

    const [avatarPreview, setAvatarPreview] = useState<string>(MOCK_ARTIST.avatarUrl);
    const [bannerPreview, setBannerPreview] = useState<string | null>(MOCK_ARTIST.bannerUrl);
    const [saved,         setSaved]         = useState(false);

    const avatarRef = useRef<HTMLInputElement>(null);
    const bannerRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setBannerPreview(URL.createObjectURL(file));
    };

    const onSubmit = async (values: FormValues) => {
        console.log('save settings', values);
        // TODO: PUT /api/artist-dashboard/profile
        await new Promise(r => setTimeout(r, 800));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="artist-settings-page">

            <div className="artist-settings-page__header">
                <h1 className="artist-settings-page__title">Налаштування профілю</h1>
                <p className="artist-settings-page__subtitle">
                    Ці дані відображаються на твоїй публічній сторінці артиста
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="artist-settings-page__section">

                    {/* ─── Банер ──────────────────────── */}
                    <div className="artist-settings-page__field-group mb-5">
                        <label className="artist-settings-page__field-label">Банер профілю</label>
                        <div
                            className="artist-settings-page__banner"
                            onClick={() => bannerRef.current?.click()}
                        >
                            {bannerPreview ? (
                                <img src={bannerPreview} alt="banner" />
                            ) : (
                                <div className="artist-settings-page__banner-placeholder">
                                    <i className="bi bi-image" />
                                    <span>Клікни щоб завантажити банер</span>
                                    <span className="artist-settings-page__banner-hint">
                                        Рекомендований розмір: 1920×400px
                                    </span>
                                </div>
                            )}
                            <div className="artist-settings-page__banner-overlay">
                                <i className="bi bi-pencil" />
                                {bannerPreview ? 'Змінити банер' : 'Завантажити банер'}
                            </div>
                        </div>
                        <input ref={bannerRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="d-none" onChange={handleBannerChange} />
                    </div>

                    {/* ─── Аватарка + форма ───────────── */}
                    <div className="row g-4 align-items-start">

                        {/* Аватарка */}
                        <div className="col-auto">
                            <label className="artist-settings-page__field-label">Фото профілю</label>
                            <div
                                className="artist-settings-page__avatar"
                                onClick={() => avatarRef.current?.click()}
                            >
                                <img src={avatarPreview} alt="avatar" />
                                <div className="artist-settings-page__avatar-overlay">
                                    <i className="bi bi-pencil" />
                                </div>
                            </div>
                            <input ref={avatarRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="d-none" onChange={handleAvatarChange} />
                            <p className="artist-settings-page__hint">JPG, PNG, WEBP</p>
                        </div>

                        {/* Поля */}
                        <div className="col">
                            {/* Ім'я артиста */}
                            <div className="mb-4">
                                <label className="artist-settings-page__field-label">
                                    Ім'я артиста *
                                </label>
                                <input
                                    type="text"
                                    className={`client-modal__input${errors.stageName ? ' client-modal__input--error' : ''}`}
                                    {...register('stageName', {
                                        required: "Ім'я обов'язкове",
                                        maxLength: { value: 100, message: 'Максимум 100 символів' },
                                    })}
                                />
                                {errors.stageName && (
                                    <p className="client-modal__field-error">{errors.stageName.message}</p>
                                )}
                            </div>

                            {/* Країна */}
                            <div className="mb-4">
                                <label className="artist-settings-page__field-label">Країна</label>
                                <input
                                    type="text"
                                    className="client-modal__input"
                                    placeholder="Наприклад: Україна"
                                    {...register('country')}
                                />
                            </div>

                            {/* Біо */}
                            <div className="mb-4">
                                <label className="artist-settings-page__field-label">Про себе</label>
                                <textarea
                                    className="client-modal__input"
                                    rows={5}
                                    placeholder="Розкажи слухачам про свою музику..."
                                    style={{ resize: 'vertical' }}
                                    {...register('bio', {
                                        maxLength: { value: 500, message: 'Максимум 500 символів' },
                                    })}
                                />
                                {errors.bio && (
                                    <p className="client-modal__field-error">{errors.bio.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

                {/* ─── Кнопка зберегти ──────────────── */}
                <div className="artist-settings-page__footer">
                    {saved && (
                        <span className="artist-settings-page__saved">
                            <i className="bi bi-check-circle me-2" />
                            Збережено!
                        </span>
                    )}
                    <button
                        type="submit"
                        className="client-modal__btn client-modal__btn--primary"
                        disabled={isSubmitting || !isDirty}
                    >
                        {isSubmitting
                            ? <><span className="spinner-border spinner-border-sm me-2" />Збереження...</>
                            : 'Зберегти зміни'
                        }
                    </button>
                </div>
            </form>
        </div>
    );
};