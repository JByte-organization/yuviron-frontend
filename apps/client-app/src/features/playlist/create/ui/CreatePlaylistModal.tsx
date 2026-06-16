'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Modal } from '@/shared/ui/Modal';
import { CoverUpload } from '@/shared/ui/CoverUpload';
import { usePostApiMePlaylists, usePostApiFilesUpload, PlaylistVisibility, type postApiFilesUploadResponseSuccess } from '@repo/api/client.ts';
import { getImageUrl } from '@/shared/lib/getImageUrl';

interface CreatePlaylistModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

interface ValidationErrorResponse {
    title: string;
    status: number;
    detail: string;
    errors?: Record<string, string[]>;
    instance: string;
}

type FormValues = {
    name: string;
    isPrivate: boolean;
};

export const CreatePlaylistModal = ({
                                        isOpen,
                                        onClose,
                                        onSuccess,
                                    }: CreatePlaylistModalProps) => {
    const { mutateAsync: createPlaylist } = usePostApiMePlaylists();
    const { mutateAsync: uploadFile } = usePostApiFilesUpload();

    const [coverFileId, setCoverFileId] = useState<string | null>(null);
    const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
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
            name: '',
            isPrivate: false,
        },
    });

    useEffect(() => {
        if (isOpen) {
            reset({
                name: '',
                isPrivate: false,
            });
            setCoverFileId(null);
            setCoverPreviewUrl(null);
        }
    }, [isOpen, reset]);

    const activePreviewUrl = useMemo(() => {
        if (!coverPreviewUrl) return null;

        if (coverPreviewUrl.startsWith('blob:') || coverPreviewUrl.startsWith('data:') || coverPreviewUrl.startsWith('/api')) {
            return coverPreviewUrl;
        }

        return getImageUrl(coverPreviewUrl);
    }, [coverPreviewUrl]);

    const handleFileChange = async (file: File | null) => {
        if (!file) {
            setCoverFileId(null);
            setCoverPreviewUrl(null);
            return;
        }

        const localUrl = URL.createObjectURL(file);
        setCoverPreviewUrl(localUrl);
        setIsUploadingImage(true);
        clearErrors('name');

        try {
            const response = await uploadFile({ data: { file } });
            const successResponse = response as postApiFilesUploadResponseSuccess;

            setCoverFileId(successResponse.data.fileId ?? null);
        } catch (error) {
            setCoverPreviewUrl(null);
            setCoverFileId(null);

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
        const requestBody = {
            title: values.name,
            coverFileId: coverFileId,
            visibility: values.isPrivate ? PlaylistVisibility.Private : PlaylistVisibility.Public,
        };

        try {
            await createPlaylist({ data: requestBody as Parameters<typeof createPlaylist>[0]['data'] });
            onSuccess?.();
            handleClose();
        } catch (error) {
            console.error('[CreatePlaylist Error] Помилка створення:', error);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Створення плейліста">
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
                            <p className="text-center small text-secondary mt-1">Завантаження...</p>
                        )}
                    </div>

                    <div className="col">
                        <div className="mb-3">
                            <input
                                type="text"
                                placeholder="Назва плейліста"
                                className={`client-modal__input${errors.name && errors.name.type !== 'server' ? ' client-modal__input--error' : ''}`}
                                {...register('name', {
                                    required: "Назва обов'язкова",
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
                        Створити
                    </button>
                </div>
            </form>
        </Modal>
    );
};