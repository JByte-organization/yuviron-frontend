'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Modal } from '@/shared/ui/Modal';
import { CoverUpload } from '@/shared/ui/CoverUpload';

export interface PlaylistToEdit {
    id: string;
    name: string;
    description?: string | null;
    coverUrl?: string | null;
    isPrivate: boolean;
}

interface EditPlaylistModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    playlist: PlaylistToEdit;
}

type FormValues = {
    name: string;
    description?: string;
    coverFile?: File | null;
    isPrivate: boolean;
};

export const EditPlaylistModal = ({
                                      isOpen,
                                      onClose,
                                      onSuccess,
                                      playlist,
                                  }: EditPlaylistModalProps) => {
    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        defaultValues: {
            name:        playlist.name,
            description: playlist.description ?? '',
            coverFile:   null,
            isPrivate:   playlist.isPrivate,
        },
    });

    const handleClose = () => {
        reset();
        onClose();
    };

    const onSubmit = async (values: FormValues) => {
        console.log('edit playlist', playlist.id, values);
        // TODO: usePutApiUserPlaylistsId()
        onSuccess?.();
        handleClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Редагування плейліста"
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row g-3">

                    <div className="col-12 col-sm-auto">
                        <Controller
                            name="coverFile"
                            control={control}
                            render={({ field }) => (
                                <CoverUpload
                                    value={field.value}
                                    previewUrl={playlist.coverUrl}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                    </div>

                    <div className="col">

                        <div className="mb-3">
                            <input
                                type="text"
                                placeholder="Назва плейліста"
                                className={`client-modal__input${errors.name ? ' client-modal__input--error' : ''}`}
                                {...register('name', {
                                    required: "Назва обов'язкова",
                                    maxLength: { value: 100, message: 'Максимум 100 символів' },
                                })}
                            />
                            {errors.name && (
                                <p className="client-modal__field-error">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="mb-3">
                            <textarea
                                placeholder="Додати опис (необов'язково)"
                                className="client-modal__textarea"
                                rows={3}
                                {...register('description', {
                                    maxLength: { value: 300, message: 'Максимум 300 символів' },
                                })}
                            />
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
                                    <span className="client-modal__toggle-label">
                                        Зробити приватним
                                    </span>
                                </div>
                            )}
                        />

                    </div>
                </div>

                <p className="client-modal__hint">
                    Продовжуючи, ти надаєш доступ до вибраного зображення.
                    Будь ласка, не завантажуй файли, які ти не маєш права поширювати.
                </p>

                <div className="client-modal__footer">
                    <button
                        type="button"
                        className="client-modal__btn client-modal__btn--ghost"
                        onClick={handleClose}
                    >
                        Скасувати
                    </button>
                    <button
                        type="submit"
                        className="client-modal__btn client-modal__btn--primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting && (
                            <span className="spinner-border spinner-border-sm me-2" />
                        )}
                        Зберегти
                    </button>
                </div>
            </form>
        </Modal>
    );
};