'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Modal } from '@/shared/ui/Modal';
import { CoverUpload } from '@/shared/ui/CoverUpload';

interface CreatePlaylistModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

type FormValues = {
    name: string;
    description?: string;
    coverFile?: File | null;
    isPrivate: boolean;
};

export const CreatePlaylistModal = ({
                                        isOpen,
                                        onClose,
                                        onSuccess,
                                    }: CreatePlaylistModalProps) => {
    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        defaultValues: {
            name: '',
            description: '',
            coverFile: null,
            isPrivate: false,
        },
    });

    const handleClose = () => {
        reset();
        onClose();
    };

    const onSubmit = async (values: FormValues) => {
        console.log('create playlist', values);
        // TODO: usePostApiUserPlaylists()
        // const formData = new FormData();
        // formData.append('name', values.name);
        // if (values.description) formData.append('description', values.description);
        // if (values.coverFile)   formData.append('cover', values.coverFile);
        // formData.append('isPrivate', String(values.isPrivate));
        // await createPlaylist({ data: formData });
        onSuccess?.();
        handleClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Створення плейліста"
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row g-3">

                    {/* Обкладинка */}
                    <div className="col-12 col-sm-auto">
                        <Controller
                            name="coverFile"
                            control={control}
                            render={({ field }) => (
                                <CoverUpload
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={errors.coverFile?.message}
                                />
                            )}
                        />
                    </div>

                    {/* Поля */}
                    <div className="col">
                        {/* Назва */}
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

                        {/* Опис */}
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

                        {/* Приватність — toggle */}
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

                {/* Кнопки */}
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
                        {isSubmitting ? (
                            <span className="spinner-border spinner-border-sm me-2" />
                        ) : null}
                        Створити
                    </button>
                </div>
            </form>
        </Modal>
    );
};