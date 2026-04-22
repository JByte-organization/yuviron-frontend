'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
    useGetApiAdminArtistsId,
    getGetApiAdminArtistsIdQueryKey,
    usePutApiAdminArtistsId,
    VerificationStatus,
    type ArtistListItemDto,
    type UpdateArtistCommand,
} from '@repo/api';

interface Props {
    artist: ArtistListItemDto | null; // артист из списка для шапки и ID
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type FormValues = {
    name: string;
    bio: string;
    // country: string;
    verificationStatus: VerificationStatus;
    avatarUrl: string;
    ownerUserId: string;
};

export const EditArtistModal = ({ artist, isOpen, onClose, onSuccess }: Props) => {
    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>();

    const artistId = artist?.id ?? '';

    // 1. Получаем полные детали артиста
    const { data: details, isLoading } = useGetApiAdminArtistsId(
        artistId,
        {
            query: {
                queryKey: getGetApiAdminArtistsIdQueryKey(artistId),
                enabled: isOpen && !!artistId,
            },
        }
    );

    const { mutateAsync: updateArtist, isPending } = usePutApiAdminArtistsId();

    // 2. Предзаполняем форму, когда данные загружены
    useEffect(() => {
        if (!details) return;
        const d = (details as any).data || details;

        reset({
            name: d.name ?? '',
            bio: d.bio ?? '',
            // country: d.country ?? '',
            verificationStatus: d.verificationStatus ?? 'Pending',
            avatarUrl: d.avatarUrl ?? '',
            ownerUserId: d.ownerUserId || d.ownerId || '',
        });
    }, [details, reset]);

    const onSubmit = async (values: FormValues) => {
        if (!artistId) return;

        const body: UpdateArtistCommand = {
            name: values.name,
            bio: values.bio || '',
            verificationStatus: values.verificationStatus,
            avatarUrl: values.avatarUrl || null,
            ownerUserId: values.ownerUserId,
        };

        try {
            await updateArtist({ id: artistId, data: body });
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
                setError('root', { message: `Error ${status}: Failed to update artist.` });
            }
        }
    };

    if (!isOpen || !artist) return null;

    const avatarSrc = artist.avatarUrl
        ? `https://api.yuviron.com/storage/${artist.avatarUrl}`
        : null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content bg-admin-primary border border-secondary shadow-lg text-white">

                    {/* Header */}
                    <div className="modal-header border-secondary p-4">
                        <div className="d-flex align-items-center gap-3">
                            <div
                                className="rounded-circle bg-secondary d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0"
                                style={{ width: '45px', height: '45px' }}
                            >
                                {avatarSrc
                                    ? <img src={avatarSrc} alt="avatar" className="w-100 h-100 object-fit-cover" />
                                    : <span className="fw-bold">{artist.name?.charAt(0)?.toUpperCase()}</span>
                                }
                            </div>
                            <div>
                                <h5 className="modal-title fw-bold mb-0 text-cyan">Edit Artist</h5>
                                <small className="text-secondary">ID: {artist.id}</small>
                            </div>
                        </div>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose} />
                    </div>

                    {isLoading ? (
                        <div className="modal-body p-5 text-center">
                            <div className="spinner-border text-info" />
                            <p className="text-secondary mt-3">Fetching artist details...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="modal-body p-4">

                                {/* Name */}
                                <div className="mb-4">
                                    <label className="form-label admin-text small fw-bold">ARTIST NAME *</label>
                                    <input
                                        type="text"
                                        className={`form-control admin-login__input ${errors.name ? 'is-invalid' : ''}`}
                                        {...register('name', { required: 'Name is required' })}
                                    />
                                    {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                                </div>

                                <div className="row">
                                    {/*/!* Country *!/*/}
                                    {/*<div className="col-md-6 mb-4">*/}
                                    {/*    <label className="form-label admin-text small fw-bold">COUNTRY</label>*/}
                                    {/*    <input*/}
                                    {/*        type="text"*/}
                                    {/*        className="form-control admin-login__input"*/}
                                    {/*        {...register('country')}*/}
                                    {/*    />*/}
                                    {/*</div>*/}

                                    {/* Status */}
                                    <div className="col-md-6 mb-4">
                                        <label className="form-label admin-text small fw-bold">STATUS</label>
                                        <select
                                            className="form-select admin-login__input text-white"
                                            {...register('verificationStatus')}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Verified">Verified</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Bio */}
                                <div className="mb-3">
                                    <label className="form-label admin-text small fw-bold">BIOGRAPHY</label>
                                    <textarea
                                        className="form-control admin-login__input h-auto py-3"
                                        rows={4}
                                        {...register('bio')}
                                    />
                                </div>

                                {/* Avatar URL (временно как текстовое поле) */}
                                <div className="mb-2">
                                    <label className="form-label admin-text small fw-bold">AVATAR PATH</label>
                                    <input
                                        type="text"
                                        className="form-control admin-login__input text-secondary"
                                        {...register('avatarUrl')}
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