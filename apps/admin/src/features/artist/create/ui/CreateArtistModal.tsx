'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import {
    usePostApiAdminArtists,
    useGetApiAdminUsers,
    VerificationStatus,
} from '@repo/api/admin.ts';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type FormValues = {
    name: string;
    ownerEmail: string;
    ownerUserId: string;
    bio: string;
    country: string;
    verificationStatus: VerificationStatus;
};

const ALLOWED_COUNTRIES = [
    { value: 'Ukraine', label: 'Ukraine' },
    { value: 'United States', label: 'United States' },
    { value: 'United Kingdom', label: 'United Kingdom' },
    { value: 'Germany', label: 'Germany' },
    { value: 'Poland', label: 'Poland' },
    { value: 'France', label: 'France' },
    { value: 'Canada', label: 'Canada' },
    { value: 'Spain', label: 'Spain' },
    { value: 'Italy', label: 'Italy' },
];

export const CreateArtistModal = ({ isOpen, onClose, onSuccess }: Props) => {
    const {
        register,
        handleSubmit,
        setError,
        setValue,
        clearErrors,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        // 🚨 1) ФИКС: Мгновенная валидация при любом изменении символа
        mode: 'onChange',
        defaultValues: {
            name: '',
            ownerEmail: '',
            ownerUserId: '',
            bio: '',
            country: '',
            verificationStatus: 'Pending' as VerificationStatus,
        },
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const { data: usersData, isLoading: isSearching } = useGetApiAdminUsers({
        Search: searchQuery,
        PageSize: 5
    } as any, {
        enabled: searchQuery.length > 2,
    } as any);

    const { mutateAsync: createArtist, isPending } = usePostApiAdminArtists();
    const foundUsers = (usersData as any)?.items ?? [];

    const handleSelectUser = useCallback((user: any) => {
        setValue('ownerEmail', user.email, { shouldValidate: true });
        setValue('ownerUserId', user.id, { shouldValidate: true });
        clearErrors(['ownerEmail', 'ownerUserId']);
        setIsDropdownOpen(false);
        setSearchQuery('');
    }, [setValue, clearErrors]);

    const handleReset = useCallback(() => {
        reset();
        setSearchQuery('');
        setIsDropdownOpen(false);
    }, [reset]);

    const onSubmit = async (values: FormValues) => {
        if (!values.ownerUserId) {
            setError('ownerEmail', { type: 'manual', message: 'Please select a user from the results list' });
            return;
        }

        const body = {
            Name: values.name,
            OwnerUserId: values.ownerUserId,
            Bio: values.bio || "",
            Country: values.country,
            VerificationStatus: values.verificationStatus,
        };

        try {
            await createArtist({ data: body } as any);
            onSuccess();
            onClose();
            handleReset();
        } catch (error: any) {
            const status = error.response?.status;
            const detail = error.response?.data?.detail || "";
            const serverErrors = error.response?.data?.errors;

            if (status === 400 || status === 409) {
                if (detail.includes('already has an artist') || serverErrors?.OwnerUserId) {
                    setError('ownerEmail', {
                        type: 'manual',
                        message: 'This user already has an artist profile. Multiple artists per user are not allowed.'
                    });
                    return;
                }
            }

            if (serverErrors) {
                Object.keys(serverErrors).forEach((field) => {
                    const key = (field.charAt(0).toLowerCase() + field.slice(1)) as keyof FormValues;
                    setError(key, { type: 'server', message: serverErrors[field]?.[0] });
                });
            } else {
                alert(`Error: ${detail || 'Failed to create artist'}`);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content bg-admin-primary border border-secondary shadow-lg text-white">
                    <div className="modal-header border-secondary p-4">
                        <h5 className="modal-title fw-bold">
                            <span className="text-info me-2">●</span>
                            Create New Artist
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={() => { onClose(); handleReset(); }} />
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="modal-body p-4">

                            {/* Artist Name */}
                            <div className="mb-4">
                                <label className="form-label admin-text small fw-bold text-uppercase">Artist Name *</label>
                                <input
                                    type="text"
                                    className={`form-control admin-login__input ${errors.name ? 'is-invalid' : ''}`}
                                    placeholder="e.g. The Rock Band"
                                    {...register('name', { required: 'Artist name is required' })}
                                />
                                {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                            </div>

                            {/* Owner Search */}
                            <div className="mb-4 position-relative">
                                <label className="form-label admin-text small fw-bold text-uppercase">Owner Email (Linked User) *</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    className={`form-control admin-login__input ${errors.ownerEmail ? 'border-danger' : ''}`}
                                    placeholder="Start typing email to search user..."
                                    {...register('ownerEmail', {
                                        onChange: (e) => {
                                            setSearchQuery(e.target.value);
                                            setIsDropdownOpen(true);
                                            setValue('ownerUserId', '');
                                        }
                                    })}
                                />
                                {errors.ownerEmail && (
                                    <div className="text-danger small mt-2 fw-medium">⚠️ {errors.ownerEmail.message}</div>
                                )}

                                {isDropdownOpen && searchQuery.length > 2 && (
                                    <div className="list-group position-absolute w-100 shadow-lg z-3 mt-1" style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #444' }}>
                                        {isSearching ? (
                                            <div className="list-group-item bg-dark text-info border-secondary small">Searching users...</div>
                                        ) : foundUsers.length > 0 ? (
                                            foundUsers.map((user: any) => (
                                                <button
                                                    key={user.id}
                                                    type="button"
                                                    className="list-group-item list-group-item-action bg-dark text-white border-secondary small py-2"
                                                    onClick={() => handleSelectUser(user)}
                                                >
                                                    <div className="fw-bold">{user.firstName || 'User'}</div>
                                                    <div className="text-secondary small">{user.email}</div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="list-group-item bg-dark text-danger border-secondary small">No users found for "{searchQuery}"</div>
                                        )}
                                    </div>
                                )}
                                <input type="hidden" {...register('ownerUserId')} />
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-4">
                                    <label className="form-label admin-text small fw-bold text-uppercase">Country *</label>
                                    <select
                                        className={`form-select admin-login__input text-white ${errors.country ? 'is-invalid' : ''}`}
                                        {...register('country', { required: 'Please choose a valid country allocation' })}
                                    >
                                        <option value="" disabled className="text-secondary">Select country...</option>
                                        {ALLOWED_COUNTRIES.map(c => (
                                            <option key={c.value} value={c.value} className="text-white">{c.label}</option>
                                        ))}
                                    </select>
                                    {errors.country && <div className="invalid-feedback d-block">{errors.country.message}</div>}
                                </div>

                                <div className="col-md-6 mb-4">
                                    <label className="form-label admin-text small fw-bold text-uppercase">Status</label>
                                    <select className="form-select admin-login__input text-white" {...register('verificationStatus')}>
                                        <option value="Pending">Pending</option>
                                        <option value="Verified">Verified</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mb-0">
                                <label className="form-label admin-text small fw-bold text-uppercase">Biography</label>
                                <textarea
                                    className="form-control admin-login__input h-auto py-3"
                                    rows={3}
                                    placeholder="Write something about the artist..."
                                    {...register('bio')}
                                />
                            </div>
                        </div>

                        <div className="modal-footer border-0 p-4">
                            <button type="button" className="btn btn-admin-dark px-4 shadow-none" onClick={() => { onClose(); handleReset(); }}>Cancel</button>
                            <button type="submit" className="btn btn-primary px-5 fw-bold shadow-sm" disabled={isPending || isSubmitting}>
                                {isPending ? <><span className="spinner-border spinner-border-sm me-2" />Creating...</> : 'Create Artist'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};