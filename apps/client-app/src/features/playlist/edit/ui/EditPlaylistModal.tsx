'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Modal } from '@/shared/ui/Modal';
import { CoverUpload } from '@/shared/ui/CoverUpload';
import { usePostApiFilesUpload, type postApiFilesUploadResponseSuccess } from '@repo/api/client.ts';
import { getImageUrl } from '@/shared/lib/getImageUrl';

export interface PlaylistToEdit {
    id: string;
    name: string;
    coverUrl?: string | null;
    isPrivate: boolean;
}

interface ValidationErrorResponse {
    title: string;
    status: number;
    detail: string;
    errors?: Record<string, string[]>;
    instance: string;
}

interface EditPlaylistModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (values: {
        name: string;
        coverFileId: string | null;
        coverUrl: string | null;
        isPrivate: boolean;
    }) => Promise<void>;
    playlist: PlaylistToEdit;
}

type FormValues = {
    name: string;
    isPrivate: boolean;
};

export const EditPlaylistModal = ({
                                      isOpen,
                                      onClose,
                                      onSuccess,
                                      playlist,
                                  }: EditPlaylistModalProps) => {
    const { mutateAsync: uploadFile } = usePostApiFilesUpload();

    const [coverFileId, setCoverFileId] = useState<string | null>(null);
    const [currentCoverUrl, setCurrentCoverUrl] = useState<string | null>(playlist.coverUrl ?? null);
    const [instantPreview, setInstantPreview] = useState<string | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        reset,
        setError,
        clearErrors,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        defaultValues: {
            name:        playlist.name,
            isPrivate:   playlist.isPrivate,
        },
    });

    useEffect(() => {
        if (isOpen) {
            reset({
                name:        playlist.name,
                isPrivate:   playlist.isPrivate,
            });
            setCoverFileId(null);
            setCurrentCoverUrl(playlist.coverUrl ?? null);
            setInstantPreview(null);
        }
    }, [isOpen, playlist, reset]);

    const activePreviewUrl = useMemo(() => {
        if (instantPreview) return instantPreview;

        if (currentCoverUrl && currentCoverUrl.startsWith('/api')) {
            return currentCoverUrl;
        }

        // Если путь "covers/..." — getImageUrl сделает из него полноценную ссылку
        return getImageUrl(currentCoverUrl) ?? '/playlist/placeholder.png';
    }, [instantPreview, currentCoverUrl]);

    const handleFileChange = async (file: File | null) => {
        if (!file) {
            setCoverFileId(null);
            setCurrentCoverUrl(null);
            setInstantPreview(null);
            return;
        }

        const localUrl = URL.createObjectURL(file);
        setInstantPreview(localUrl);
        setIsUploadingImage(true);
        clearErrors('name');

        try {
            const response = await uploadFile({ data: { file } });
            const successResponse = response as postApiFilesUploadResponseSuccess;

            // 🌟 Передаем оригинальный fileId (бэк сейчас починит привязку по GUID)
            setCoverFileId(successResponse.data.fileId ?? null);
            setCurrentCoverUrl(successResponse.data.url ?? null);
        } catch (error) {
            setInstantPreview(null);
            const serverError = error as { response?: { data?: ValidationErrorResponse } };
            const errorData = serverError.response?.data;

            if (errorData?.errors) {
                let userFriendlyMessage = "Не вдалося завантажити зображення";
                const rawError = errorData.errors.FileName?.[0] || errorData.errors['']?.[0] || '';

                if (rawError.includes('Dangerous file type')) {
                    userFriendlyMessage = "Непідтримуваний формат. Дозволені тільки .jpg, .jpeg, .png, .webp";
                } else if (rawError.includes('Image dimensions are invalid')) {
                    userFriendlyMessage = "Некоректний розмір зображення (занадто велике або мале)";
                } else if (rawError) {
                    userFriendlyMessage = rawError;
                }

                setError('name', { type: 'server', message: userFriendlyMessage });
            }
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const onSubmit = async (values: FormValues) => {
        try {
            await onSuccess?.({
                name:        values.name,
                coverFileId: coverFileId,
                coverUrl:    currentCoverUrl, // Передаем путь в стейт страницы плейлиста
                isPrivate:   values.isPrivate,
            });

            handleClose();
        } catch (error) {
            console.error('[EditPlaylist Error] Помилка збереження форми:', error);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Редагування плейліста">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row g-3">
                    <div className="col-12 col-sm-auto">
                        <CoverUpload
                            value={null}
                            previewUrl={activePreviewUrl}
                            onChange={handleFileChange}
                            error={errors.name?.type === 'server' ? errors.name?.message : undefined}
                            disabled={isUploadingImage}
                        />
                        {isUploadingImage && (
                            <p className="text-center small text-secondary mt-1">Оновлення...</p>
                        )}
                    </div>

                    <div className="col">
                        <div className="mb-3">
                            <input
                                type="text"
                                placeholder="Назва плейліста"
                                className={`client-modal__input${errors.name && errors.name.type !== 'server' ? ' client-modal__input--error' : ''}`}
                                {...register('name', {
                                    required:  "Назва обов'язкова",
                                    maxLength: { value: 100, message: 'Максимум 100 символів' },
                                })}
                            />
                            {errors.name && errors.name.type !== 'server' && (
                                <p className="client-modal__field-error">{errors.name.message}</p>
                            )}
                        </div>

                        <Controller
                            name="isPrivate"
                            control={control}
                            render={({ field }) => (
                                <div className="client-modal__toggle-row">
                                    <button
                                        type="button"
                                        className={`client-modal__toggle${field.value ? ' client-modal__toggle--active' : ''}`}
                                        onClick={() => field.onChange(!field.value)}
                                        aria-label="Зробити приватним"
                                    >
                                        <span className="client-modal__toggle-thumb" />
                                    </button>
                                    <span className="client-modal__toggle-label">Зробити приватним</span>
                                </div>
                            )}
                        />
                    </div>
                </div>

                <div className="client-modal__footer">
                    <button type="button" className="client-modal__btn client-modal__btn--ghost" onClick={handleClose} disabled={isUploadingImage}>
                        Скасувати
                    </button>
                    <button type="submit" className="client-modal__btn client-modal__btn--primary" disabled={isSubmitting || isUploadingImage}>
                        Зберегти
                    </button>
                </div>
            </form>
        </Modal>
    );
};