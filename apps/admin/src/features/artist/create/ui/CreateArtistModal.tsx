'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
    usePostApiAdminArtists,
    useGetApiAdminUsers,
    VerificationStatus,
} from '@repo/api';

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

    // Поиск пользователей по Search или Email (зависит от API)
    const { data: usersData, isLoading: isSearching } = useGetApiAdminUsers({
        Search: searchQuery,
        PageSize: 5
    } as any, {
        query: {
            enabled: searchQuery.length > 2,
            keepPreviousData: true
        }
    });

    const { mutateAsync: createArtist, isPending } = usePostApiAdminArtists();

    // Извлекаем айтемы (учитываем, что они в корне объекта)
    const foundUsers = (usersData as any)?.items ?? [];

    const handleSelectUser = (user: any) => {
        setValue('ownerEmail', user.email, { shouldValidate: true });
        setValue('ownerUserId', user.id, { shouldValidate: true });
        clearErrors(['ownerEmail', 'ownerUserId']);
        setIsDropdownOpen(false);
        setSearchQuery('');
    };

    const onSubmit = async (values: FormValues) => {
        if (!values.ownerUserId) {
            setError('ownerEmail', { type: 'manual', message: 'Please select a user from the results list' });
            return;
        }

        const body = {
            Name: values.name,
            OwnerUserId: values.ownerUserId,
            Bio: values.bio || "",
            Country: values.country || "",
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

            // Проверка правила: 1 Юзер = 1 Артист
            if (status === 400 || status === 409) {
                // Ищем в ошибках валидации или в тексте ошибки
                if (detail.includes('already has an artist') || serverErrors?.OwnerUserId) {
                    setError('ownerEmail', {
                        type: 'manual',
                        message: 'This user already has an artist profile. Multiple artists per user are not allowed.'
                    });
                    return;
                }
            }

            // Маппинг остальных серверных ошибок
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

    const handleReset = () => {
        reset();
        setSearchQuery('');
        setIsDropdownOpen(false);
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
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            onClick={() => { onClose(); handleReset(); }}
                        />
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
                                <div className="input-group">
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        className={`form-control admin-login__input ${errors.ownerEmail ? 'border-danger' : ''}`}
                                        placeholder="Start typing email to search user..."
                                        {...register('ownerEmail', {
                                            onChange: (e) => {
                                                setSearchQuery(e.target.value);
                                                setIsDropdownOpen(true);
                                                setValue('ownerUserId', ''); // Сброс ID при изменении
                                            }
                                        })}
                                    />
                                </div>

                                {/* Красивое сообщение об ошибке (например, если юзер уже занят) */}
                                {errors.ownerEmail && (
                                    <div className="text-danger small mt-2 fw-medium d-flex align-items-center">
                                        <span className="me-1">⚠️</span> {errors.ownerEmail.message}
                                    </div>
                                )}

                                {/* Dropdown результатов */}
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
                                    <label className="form-label admin-text small fw-bold text-uppercase">Country</label>
                                    <input
                                        type="text"
                                        className="form-control admin-login__input"
                                        placeholder="Ukraine"
                                        {...register('country')}
                                    />
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
                            <button
                                type="button"
                                className="btn btn-admin-dark px-4 shadow-none"
                                onClick={() => { onClose(); handleReset(); }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary px-5 fw-bold shadow-sm"
                                disabled={isPending || isSubmitting}
                            >
                                {isPending ? (
                                    <><span className="spinner-border spinner-border-sm me-2" />Creating...</>
                                ) : 'Create Artist'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};