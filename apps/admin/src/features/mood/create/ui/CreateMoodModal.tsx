'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { usePostApiAdminMoods } from '@repo/api';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type FormValues = {
    name: string;
    coverUrl: string;
};

export const CreateMoodModal = ({ isOpen, onClose, onSuccess }: Props) => {
    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>();

    const { mutateAsync: createMood, isPending } = usePostApiAdminMoods();

    const onSubmit = async (values: FormValues) => {
        try {
            await createMood({
                data: {
                    name: values.name,
                    coverFileId: values.coverUrl || null,
                },
            });
            reset();
            onSuccess();
            onClose();
        } catch (error: any) {
            const status = error.response?.status;
            const serverErrors = error.response?.data?.errors;

            if (status === 400 && serverErrors) {
                Object.keys(serverErrors).forEach((field) => {
                    const key = (field.charAt(0).toLowerCase() + field.slice(1)) as keyof FormValues;
                    setError(key, { type: 'server', message: serverErrors[field]?.[0] });
                });
            } else {
                setError('root', { message: `Error ${status}: Failed to create mood.` });
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content bg-admin-primary border border-secondary shadow-lg text-white">

                    <div className="modal-header border-secondary p-4">
                        <h5 className="modal-title fw-bold text-cyan">Create Mood</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose} />
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="modal-body p-4">

                            {errors.root && (
                                <div className="alert alert-danger py-2 mb-3">
                                    {errors.root.message}
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="form-label admin-text small fw-bold">NAME *</label>
                                <input
                                    type="text"
                                    className={`form-control admin-login__input ${errors.name ? 'is-invalid' : ''}`}
                                    {...register('name', { required: 'Name is required' })}
                                />
                                {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                            </div>

                            <div className="mb-2">
                                <label className="form-label admin-text small fw-bold">COVER PATH</label>
                                <input
                                    type="text"
                                    className="form-control admin-login__input text-secondary"
                                    placeholder="covers/example.jpg"
                                    {...register('coverUrl')}
                                />
                            </div>

                        </div>

                        <div className="modal-footer border-0 p-4">
                            <button type="button" className="btn btn-admin-dark px-4" onClick={onClose}>
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary px-5 fw-bold"
                                disabled={isPending || isSubmitting}
                            >
                                {isPending ? 'Creating...' : 'Create Mood'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};