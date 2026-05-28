'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
    useGetApiAdminUsersId,
    getGetApiAdminUsersIdQueryKey,
    usePutApiAdminUsersId,
    useGetApiAdminRoles,
    AccountState,
    Gender,
    type UserDetailsDto,
    type UpdateUserCommand,
    type RoleDto,
    type UserListItemDto,
} from '@repo/api';
import {getImageUrl} from "@/shared/lib/getImageUrl";

interface Props {
    user: UserListItemDto | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type FormValues = {
    email: string;
    firstName: string;
    dateOfBirth: string;
    gender: Gender;
    accountState: AccountState;
    acceptMarketing: boolean;
    roleId: string;
};

const MAX_BIRTH_DATE = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 16);
    return d.toISOString().slice(0, 10);
})();

export const EditUserModal = ({ user, isOpen, onClose, onSuccess }: Props) => {
    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>();

    // Загружаем детальные данные юзера для предзаполнения формы
    const userId = user?.id ?? '';
    const { data: detailsResponse, isLoading } = useGetApiAdminUsersId(
        userId,
        {
            query: {
                queryKey: getGetApiAdminUsersIdQueryKey(userId),
                enabled: isOpen && !!user?.id,
            },
        }
    );
    const details = detailsResponse as unknown as UserDetailsDto;

    // Загружаем роли
    const { data: rolesResponse } = useGetApiAdminRoles();
    const roles = rolesResponse as unknown as RoleDto[];

    const { mutateAsync, isPending } = usePutApiAdminUsersId();

    // Предзаполняем форму данными из API
    useEffect(() => {
        if (!details) return;

        // Текущая роль юзера — берём первую из списка
        const currentRoleId = details.roles?.[0]?.id ?? '';

        reset({
            email: details.email ?? '',
            firstName: details.firstName ?? '',
            dateOfBirth: details.dateOfBirth
                ? new Date(details.dateOfBirth).toISOString().slice(0, 10)
                : '',
            gender: details.gender ?? Gender.NotSpecified,
            accountState: details.accountState ?? AccountState.Active,
            acceptMarketing: details.acceptMarketing ?? false,
            roleId: currentRoleId,
        });
    }, [details, reset]);

    const onSubmit = async (values: FormValues) => {
        if (!user?.id) return;

        const body: UpdateUserCommand = {
            userId: user.id,
            email: values.email,
            firstName: values.firstName || null,
            dateOfBirth: values.dateOfBirth || undefined,
            gender: values.gender,
            accountState: values.accountState,
            acceptMarketing: values.acceptMarketing,
            roleIds: values.roleId ? [values.roleId] : [],
            avatarFileId: null,
            bannerFileId: null,
        };

        try {
            await mutateAsync({ id: user.id, data: body });
            onSuccess();
            onClose();
        } catch (error: any) {
            const status = error.response?.status;
            if (status === 400 && error.response?.data?.errors) {
                const serverErrors = error.response.data.errors as Record<string, string[]>;
                Object.keys(serverErrors).forEach((field) => {
                    const key = (field.charAt(0).toLowerCase() + field.slice(1)) as keyof FormValues;
                    setError(key, { type: 'server', message: serverErrors[field]?.[0] ?? 'Validation error' });
                });
            } else if (status === 409) {
                setError('email', { type: 'server', message: 'This email is already taken' });
            } else if (status === 404) {
                alert('User not found.');
                onClose();
            } else {
                alert('Something went wrong. Please try again.');
            }
        }
    };

    if (!isOpen || !user) return null;

    //Image
    const avatarSrc = getImageUrl(user.avatarUrl);

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content bg-admin-primary border border-secondary shadow-lg text-white">

                    {/* Header с данными юзера */}
                    <div className="modal-header border-secondary p-4">
                        <div className="d-flex align-items-center gap-3">
                            <div
                                className="rounded-circle bg-secondary d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0"
                                style={{ width: '40px', height: '40px' }}
                            >
                                {avatarSrc
                                    ? <img src={avatarSrc} alt="avatar" className="w-100 h-100 object-fit-cover" />
                                    : <span className="fw-bold">{user.firstName?.charAt(0)?.toUpperCase() || '?'}</span>
                                }
                            </div>
                            <div>
                                <h5 className="modal-title fw-bold mb-0">Edit User</h5>
                                <small className="text-secondary">{user.email}</small>
                            </div>
                        </div>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose} />
                    </div>

                    {isLoading ? (
                        <div className="modal-body p-5 text-center">
                            <div className="spinner-border text-primary" />
                            <p className="text-secondary mt-3 mb-0">Loading user data...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="modal-body p-4">

                                {/* Email */}
                                <div className="mb-3">
                                    <label className="form-label admin-text small fw-bold">EMAIL *</label>
                                    <input
                                        type="email"
                                        className={`form-control admin-login__input ${errors.email ? 'is-invalid' : ''}`}
                                        {...register('email', {
                                            required: 'Email is required',
                                            maxLength: { value: 320, message: 'Max 320 characters' },
                                            pattern: {
                                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                message: 'Invalid email format',
                                            },
                                        })}
                                    />
                                    {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                                </div>

                                {/* Display Name */}
                                <div className="mb-3">
                                    <label className="form-label admin-text small fw-bold">DISPLAY NAME</label>
                                    <input
                                        type="text"
                                        className={`form-control admin-login__input ${errors.firstName ? 'is-invalid' : ''}`}
                                        {...register('firstName', {
                                            maxLength: { value: 100, message: 'Max 100 characters' },
                                        })}
                                    />
                                    {errors.firstName && <div className="invalid-feedback">{errors.firstName.message}</div>}
                                </div>

                                <div className="row">
                                    {/* Date of Birth */}
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label admin-text small fw-bold">DATE OF BIRTH</label>
                                        <input
                                            type="date"
                                            max={MAX_BIRTH_DATE}
                                            className={`form-control admin-login__input ${errors.dateOfBirth ? 'is-invalid' : ''}`}
                                            {...register('dateOfBirth', {
                                                validate: (v) => {
                                                    if (!v) return true;
                                                    return new Date(v) <= new Date(MAX_BIRTH_DATE)
                                                        || 'User must be at least 16 years old';
                                                },
                                            })}
                                        />
                                        {errors.dateOfBirth && <div className="invalid-feedback">{errors.dateOfBirth.message}</div>}
                                    </div>

                                    {/* Gender */}
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label admin-text small fw-bold">GENDER</label>
                                        <select
                                            className="form-select admin-login__input text-white"
                                            {...register('gender')}
                                        >
                                            <option value={Gender.NotSpecified}>Not Specified</option>
                                            <option value={Gender.Male}>Male</option>
                                            <option value={Gender.Female}>Female</option>
                                            <option value={Gender.NonBinary}>Non-Binary</option>
                                            <option value={Gender.Other}>Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="row">
                                    {/* Account State */}
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label admin-text small fw-bold">ACCOUNT STATE</label>
                                        <select
                                            className="form-select admin-login__input text-white"
                                            {...register('accountState')}
                                        >
                                            <option value={AccountState.Active}>Active</option>
                                            <option value={AccountState.Banned}>Banned</option>
                                            <option value={AccountState.Unknown}>Unknown</option>
                                        </select>
                                    </div>

                                    {/* Role */}
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label admin-text small fw-bold">ROLE</label>
                                        <select
                                            className="form-select admin-login__input text-white"
                                            {...register('roleId')}
                                        >
                                            <option value="">— Default user —</option>
                                            {roles?.map((role) => (
                                                <option key={role.id} value={role.id}>
                                                    {role.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Accept Marketing */}
                                <div className="form-check mt-1">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="edit-marketing"
                                        {...register('acceptMarketing')}
                                    />
                                    <label className="form-check-label small" htmlFor="edit-marketing">
                                        Accept Marketing Emails
                                    </label>
                                </div>

                            </div>

                            <div className="modal-footer border-0 p-4">
                                <button type="button" className="btn btn-admin-dark px-4" onClick={onClose}>
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-warning px-5 fw-bold text-dark"
                                    disabled={isPending || isSubmitting}
                                >
                                    {(isPending || isSubmitting)
                                        ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
                                        : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
