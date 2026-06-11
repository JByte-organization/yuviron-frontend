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
import { useCurrentArtist } from '@/entities/artist/model/currentArtist';
import {
    ArtistSocialLinksBlock,
    ArtistVerificationBlock,
} from '@/features/artist/profile/ui/ArtistProfileExtras';

import { unwrap, extractFileId, extractFileUrl } from '@/shared/lib/unwrapApi';

type FormValues = {
    stageName: string;
    bio: string;
    country: string;
};

export const ArtistSettingsPage = () => {
    const { artistId, canManage } = useCurrentArtist();
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
            // Опційні файли вантажимо окремо (як у create-флоу), отримуємо fileId +
            // тимчасовий url (його бек віддає одразу — показуємо картинку до персисту).
            let avatarFileId: string | null = null;
            let bannerFileId: string | null = null;
            let avatarTempUrl: string | null = null;
            let bannerTempUrl: string | null = null;
            if (avatarFile) {
                const res = await uploadFile({ data: { file: avatarFile } });
                avatarFileId = extractFileId(res);
                avatarTempUrl = extractFileUrl(res);
            }
            if (bannerFile) {
                const res = await uploadFile({ data: { file: bannerFile } });
                bannerFileId = extractFileId(res);
                bannerTempUrl = extractFileUrl(res);
            }

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

            // Скидаємо вибрані файли. Прев'ю лишаємо на тимчасовому url з upload
            // (а не на медіа-хеші профілю, який ще 404-ить) — fallback на старий blob,
            // якщо бек url не віддав; null → береться картинка з профілю (вже персиснута).
            setAvatarFile(null);
            setBannerFile(null);
            setAvatarObjectUrl(prev => avatarTempUrl ?? (avatarFileId ? prev : null));
            setBannerObjectUrl(prev => bannerTempUrl ?? (bannerFileId ? prev : null));
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
                        disabled={isSubmitting || !hasChanges || !artistId || !canManage}
                    >
                        {isSubmitting
                            ? <><span className="spinner-border spinner-border-sm me-2" />Збереження...</>
                            : 'Зберегти зміни'
                        }
                    </button>
                </div>
            </form>

            {/* ─── Соцмережі + верифікація (тільки для тих, хто може керувати) ─── */}
            {artistId && canManage && (
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
