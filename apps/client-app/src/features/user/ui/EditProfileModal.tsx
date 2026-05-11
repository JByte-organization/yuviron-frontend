'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Modal } from '@/shared/ui/Modal';
import { CoverUpload } from '@/shared/ui/CoverUpload';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    user: {
        name: string;
        avatarUrl?: string | null;
    };
}

type FormValues = {
    name: string;
    avatarFile?: File | null;
};

export const EditProfileModal = ({
                                     isOpen,
                                     onClose,
                                     onSuccess,
                                     user,
                                 }: EditProfileModalProps) => {
    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        defaultValues: {
            name:       user.name,
            avatarFile: null,
        },
    });

    const handleClose = () => {
        reset();
        onClose();
    };

    const onSubmit = async (values: FormValues) => {
        console.log('edit profile', values);
        // TODO: usePutApiUserProfile()
        // const formData = new FormData();
        // formData.append('name', values.name);
        // if (values.avatarFile) formData.append('avatar', values.avatarFile);
        // await updateProfile({ data: formData });
        onSuccess?.();
        handleClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Редагування профілю">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row g-3 align-items-start">

                    {/* Аватарка */}
                    <div className="col-12 col-sm-auto">
                        <Controller
                            name="avatarFile"
                            control={control}
                            render={({ field }) => (
                                <CoverUpload
                                    value={field.value}
                                    previewUrl={user.avatarUrl}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                    </div>

                    {/* Нікнейм */}
                    <div className="col">
                        <div className="mb-2">
                            <label className="client-modal__field-label">Нікнейм</label>
                            <input
                                type="text"
                                className={`client-modal__input${errors.name ? ' client-modal__input--error' : ''}`}
                                {...register('name', {
                                    required: "Нікнейм обов'язковий",
                                    maxLength: { value: 50, message: 'Максимум 50 символів' },
                                })}
                            />
                            {errors.name && (
                                <p className="client-modal__field-error">{errors.name.message}</p>
                            )}
                        </div>
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
                        {isSubmitting && <span className="spinner-border spinner-border-sm me-2" />}
                        Зберегти
                    </button>
                </div>
            </form>
        </Modal>
    );
};