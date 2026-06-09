'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    AppPermission,
    getGetApiStudioArtistProfileArtistIdQueryKey,
    useGetApiStudioArtistProfileArtistId,
    usePutApiStudioArtistProfileId,
    type StudioArtistProfileDto,
} from '@repo/api/artist.ts';
import { usePostApiFilesUpload } from '@repo/api/client.ts';
import { useQueryClient } from '@tanstack/react-query';
import { getImageUrl } from '@/shared/lib/getImageUrl';
import { useCurrentArtistId } from '@/entities/artist/model/currentArtist';
import {
    ArtistSocialLinksBlock,
    ArtistVerificationBlock,
} from '@/features/artist/profile/ui/ArtistProfileExtras';

type FormValues = {
    stageName: string;
    bio: string;
    country: string;
};

const unwrap = <T,>(raw: unknown): T | undefined => {
    if (!raw) return undefined;
    const obj = raw as { data?: T };
    return (obj.data ?? (raw as T)) as T;
};

const extractFileId = (res: unknown): string | null => {
    const r = res as { fileId?: string; data?: { fileId?: string } } | null;
    return r?.data?.fileId ?? r?.fileId ?? null;
};

export const ArtistSettingsPage = () => {
    const artistId = useCurrentArtistId();
    const queryClient = useQueryClient();

    const { data: profileRaw } = useGetApiStudioArtistProfileArtistId(artistId ?? '', {
        query: {
            enabled: !!artistId,
            queryKey: getGetApiStudioArtistProfileArtistIdQueryKey(artistId ?? ''),
        },
    });
    const profile = unwrap<StudioArtistProfileDto>(profileRaw);

    const { mutateAsync: uploadFile } = usePostApiFilesUpload();
    const { mutateAsync: updateProfile } = usePutApiStudioArtistProfileId();

    const {
        register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty },
    } = useForm<FormValues>({
        defaultValues: { stageName: '', bio: '', country: '' },
    });

    const [avatarFile,    setAvatarFile]    = useState<File | null>(null);
    const [bannerFile,    setBannerFile]    = useState<File | null>(null);
    // Локальні object-URL для щойно вибраних файлів (мають пріоритет над тим, що з бека).
    const [avatarObjectUrl, setAvatarObjectUrl] = useState<string | null>(null);
    const [bannerObjectUrl, setBannerObjectUrl] = useState<string | null>(null);
    const [saved,         setSaved]         = useState(false);
    const [error,         setError]         = useState<string | null>(null);

    const avatarRef = useRef<HTMLInputElement>(null);
    const bannerRef = useRef<HTMLInputElement>(null);

    // Прев'ю виводимо під час рендера: новий файл → object-URL, інакше — з бека.
    const avatarPreview = avatarObjectUrl ?? getImageUrl(profile?.details?.avatarUrl);
    const bannerPreview = bannerObjectUrl ?? getImageUrl(profile?.details?.bannerUrl);

    // Префіл текстових полів форми, коли профіль завантажився (reset — не setState).
    useEffect(() => {
        if (!profile) return;
        reset({
            stageName: profile.name ?? '',
            bio: profile.details?.bio ?? '',
            country: '',
        });
    }, [profile, reset]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarFile(file);
        setAvatarObjectUrl(URL.createObjectURL(file));
    };

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setBannerFile(file);
        setBannerObjectUrl(URL.createObjectURL(file));
    };

    const onSubmit = async (values: FormValues) => {
        if (!artistId) return;
        setError(null);
        try {
            // Опційні файли вантажимо окремо (як у create-флоу), отримуємо fileId.
            let avatarFileId: string | null = null;
            let bannerFileId: string | null = null;
            if (avatarFile) avatarFileId = extractFileId(await uploadFile({ data: { file: avatarFile } }));
            if (bannerFile) bannerFileId = extractFileId(await uploadFile({ data: { file: bannerFile } }));

            await updateProfile({
                id: artistId,
                data: {
                    artistId,
                    name: values.stageName.trim(),
                    bio: values.bio.trim() || null,
                    avatarFileId,
                    bannerFileId,
                    requiredPermission: AppPermission.StudioArtistManage,
                },
            });

            // Скидаємо вибрані файли (прев'ю візьметься зі свіжого профілю) та оновлюємо кеш.
            setAvatarFile(null);
            setBannerFile(null);
            setAvatarObjectUrl(null);
            setBannerObjectUrl(null);
            await queryClient.invalidateQueries({ queryKey: ['/api/studio-artist/profile'] });
            reset(values);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) {
            // Дістаємо реальну причину з axios-помилки, щоб не ховати 400/403/500 за загальним текстом.
            const err = e as {
                response?: { status?: number; data?: { detail?: string; title?: string; message?: string } };
                message?: string;
            };
            const status = err?.response?.status;
            const detail =
                err?.response?.data?.detail ??
                err?.response?.data?.title ??
                err?.response?.data?.message ??
                err?.message;
            setError(
                `Не вдалося зберегти зміни${status ? ` (${status})` : ''}.` +
                    (detail ? ` ${detail}` : ' Спробуйте ще раз.'),
            );
        }
    };

    const hasChanges = isDirty || !!avatarFile || !!bannerFile;

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
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="avatar" />
                                ) : (
                                    <div className="artist-settings-page__avatar-placeholder">
                                        <i className="bi bi-person" />
                                    </div>
                                )}
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
                                    Ім’я артиста *
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

                            {/* Країна (поки не зберігається — бек не має поля) */}
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
                    {error && <span className="client-modal__field-error me-3">{error}</span>}
                    {saved && (
                        <span className="artist-settings-page__saved">
                            <i className="bi bi-check-circle me-2" />
                            Збережено!
                        </span>
                    )}
                    <button
                        type="submit"
                        className="client-modal__btn client-modal__btn--primary"
                        disabled={isSubmitting || !hasChanges || !artistId}
                    >
                        {isSubmitting
                            ? <><span className="spinner-border spinner-border-sm me-2" />Збереження...</>
                            : 'Зберегти зміни'
                        }
                    </button>
                </div>
            </form>

            {/* ─── Соцмережі + верифікація ───────────── */}
            {artistId && (
                <>
                    <ArtistSocialLinksBlock
                        artistId={artistId}
                        initialLinks={profile?.socialLinks}
                    />
                    <ArtistVerificationBlock
                        artistId={artistId}
                        status={profile?.verificationStatus}
                    />
                </>
            )}
        </div>
    );
};
