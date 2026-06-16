'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { usePutApiMeAccountProfile, usePostApiFilesUpload } from '@repo/api/client.ts';
import { Modal } from '@/shared/ui/Modal';
import { CoverUpload } from '@/shared/ui/CoverUpload';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (localUrl: string | null | undefined) => void;
    user: {
        name: string;
        avatarUrl?: string | null;
    };
    userId: string;
}

type FormValues = {
    name: string;
    avatarFile: File | null | undefined;
};

const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });

export const EditProfileModal = ({
                                     isOpen,
                                     onClose,
                                     onSuccess,
                                     user,
                                     userId,
                                 }: EditProfileModalProps) => {

    const { mutateAsync: uploadFile } = usePostApiFilesUpload();

    const { mutateAsync: updateProfile } = usePutApiMeAccountProfile();

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        defaultValues: {
            name:       user.name,
            avatarFile: undefined,
        },
    });

    useEffect(() => {
        if (isOpen) {
            reset({
                name: user.name,
                avatarFile: undefined,
            });
        }
    }, [isOpen, user, reset]);

    const handleClose = () => {
        reset();
        onClose();
    };

    const onSubmit = async (values: FormValues) => {
        try {
            let uploadedAvatarId: string | null = null;
            let localPreviewUrl: string | null | undefined = undefined;

            if (values.avatarFile instanceof File) {
                const uploadResponse = await uploadFile({
                    data: { file: values.avatarFile }
                });

                const resData = uploadResponse as unknown as { fileId?: string; data?: { fileId?: string } };
                uploadedAvatarId = resData?.data?.fileId ?? resData?.fileId ?? null;

                const base64Img = await fileToBase64(values.avatarFile);
                localStorage.setItem(`yuviron_temp_avatar_${userId}`, JSON.stringify({
                    url: base64Img,
                    expiresAt: Date.now() + 3 * 60 * 1000
                }));

                localPreviewUrl = base64Img;
            }
            else if (values.avatarFile === null) {
                uploadedAvatarId = null;
                localPreviewUrl = null;
                localStorage.removeItem(`yuviron_temp_avatar_${userId}`);
            }

            const requestBody = {
                name: values.name,
                bio: null,
                ...(values.avatarFile !== undefined ? { avatarFileId: uploadedAvatarId } : {}),
                bannerFileId: null
            };

            await updateProfile({
                data: requestBody as Parameters<typeof updateProfile>[0]['data']
            });

            onSuccess?.(localPreviewUrl);
            handleClose();
        } catch (error) {
            console.error('[EditProfile] Помилка при збереженні профілю:', error);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Редагування профілю">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row g-3 align-items-start">
                    <div className="col-12 col-sm-auto">
                        <Controller
                            name="avatarFile"
                            control={control}
                            render={({ field }) => (
                                <CoverUpload
                                    value={field.value === undefined ? null : field.value}
                                    previewUrl={user.avatarUrl}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                    </div>
                    <div className="col">
                        <div className="mb-2">
                            <label className="client-modal__field-label">Нікнейм</label>
                            <input
                                type="text"
                                className={`client-modal__input${errors.name ? ' client-modal__input--error' : ''}`}
                                {...register('name', {
                                    required: "Нікнейм обов'язковий",
                                    maxLength: { value: 50, message: 'Максимум 50 symbols' },
                                })}
                            />
                            {errors.name && (
                                <p className="client-modal__field-error">{errors.name.message}</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="client-modal__footer mt-3">
                    <button type="button" className="client-modal__btn client-modal__btn--ghost" onClick={handleClose} disabled={isSubmitting}>
                        Скасувати
                    </button>
                    <button type="submit" className="client-modal__btn client-modal__btn--primary" disabled={isSubmitting}>
                        {isSubmitting && <span className="spinner-border spinner-border-sm me-2" />}
                        Зберегти
                    </button>
                </div>
            </form>
        </Modal>
    );
};