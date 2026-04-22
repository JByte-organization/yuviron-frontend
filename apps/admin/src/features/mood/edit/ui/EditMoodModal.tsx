'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
    useGetApiAdminMoodsId,
    getGetApiAdminMoodsIdQueryKey,
    usePutApiAdminMoodsId,
    type MoodDto,
} from '@repo/api';

interface Props {
    mood: MoodDto | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type FormValues = {
    name: string;
    coverUrl: string;
};

export const EditMoodModal = ({ mood, isOpen, onClose, onSuccess }: Props) => {
    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>();

    const moodId = mood?.id ?? '';

    const { data: details, isLoading } = useGetApiAdminMoodsId(
        moodId,
        {
            query: {
                queryKey: getGetApiAdminMoodsIdQueryKey(moodId),
                enabled: isOpen && !!moodId,
            },
        }
    );

    const { mutateAsync: updateMood, isPending } = usePutApiAdminMoodsId();

    useEffect(() => {
        if (!details) return;
        const d = (details as any).data || details;

        reset({
            name: d.name ?? '',
            coverUrl: d.coverUrl ?? '',
        });
    }, [details, reset]);

    const onSubmit = async (values: FormValues) => {
        if (!moodId) return;

        try {
            await updateMood({
                id: moodId,
                data: {
                    id: moodId,        // UpdateMoodCommand использует id, не moodId
                    name: values.name,
                    coverUrl: values.coverUrl || null,
                },
            });
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
                setError('root', { message: `Error ${status}: Failed to update mood.` });
            }
        }
    };

    if (!isOpen || !mood) return null;

    const coverSrc = mood.coverUrl
        ? `https://api.yuviron.com/storage/${mood.coverUrl}`
        : null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content bg-admin-primary border border-secondary shadow-lg text-white">

                    <div className="modal-header border-secondary p-4">
                        <div className="d-flex align-items-center gap-3">
                            <div
                                className="rounded bg-secondary d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0"
                                style={{ width: '40px', height: '40px' }}
                            >
                                {coverSrc
                                    ? <img src={coverSrc} alt="cover" className="w-100 h-100 object-fit-cover" />
                                    : <span>🎭</span>
                                }
                            </div>
                            <div>
                                <h5 className="modal-title fw-bold mb-0 text-cyan">Edit Mood</h5>
                                <small className="text-secondary">ID: {mood.id}</small>
                            </div>
                        </div>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose} />
                    </div>

                    {isLoading ? (
                        <div className="modal-body p-5 text-center">
                            <div className="spinner-border text-info" />
                            <p className="text-secondary mt-3">Fetching mood details...</p>
                        </div>
                    ) : (
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
                                    {isPending ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};