'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import {
    usePostApiAdminUsers,
    useGetApiAdminRoles,
    AccountState,
    Gender,
    type CreateUserCommand,
    type RoleDto,
} from '@repo/api';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

// Форма использует строковые значения енамов — именно то, что ждёт бэкенд
type FormValues = {
    email: string;
    password: string;
    firstName: string;
    dateOfBirth: string;
    gender: Gender;
    acceptMarketing: boolean;
    acceptTerms: boolean;
    accountState: AccountState;
    roleId: string; // выбираем одну роль → roleIds: [roleId]
};

const MAX_BIRTH_DATE = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 16);
    return d.toISOString().slice(0, 10);
})();

export const CreateUserModal = ({ isOpen, onClose, onSuccess }: Props) => {
    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        defaultValues: {
            email: '',
            password: '',
            firstName: '',
            dateOfBirth: '',
            gender: Gender.NotSpecified,
            acceptMarketing: false,
            acceptTerms: true,
            accountState: AccountState.Active,
            roleId: '',
        },
    });

    // Загружаем список ролей из API
    const { data: rolesResponse } = useGetApiAdminRoles();
    const roles = rolesResponse as unknown as RoleDto[];

    const { mutateAsync, isPending } = usePostApiAdminUsers();

    const onSubmit = async (values: FormValues) => {
        const body: CreateUserCommand = {
            email: values.email,
            password: values.password,
            firstName: values.firstName,
            dateOfBirth: values.dateOfBirth || undefined,
            gender: values.gender,
            acceptMarketing: values.acceptMarketing,
            acceptTerms: values.acceptTerms,
            accountState: values.accountState,
            roleIds: values.roleId ? [values.roleId] : [],
        };

        try {
            await mutateAsync({ data: body });
            onSuccess();
            onClose();
            reset();
        } catch (error: any) {
            const status = error.response?.status;
            if (status === 400 && error.response?.data?.errors) {
                // Маппинг серверных ошибок в поля формы (PascalCase → camelCase)
                const serverErrors = error.response.data.errors as Record<string, string[]>;
                Object.keys(serverErrors).forEach((field) => {
                    const key = (field.charAt(0).toLowerCase() + field.slice(1)) as keyof FormValues;
                    setError(key, { type: 'server', message: serverErrors[field]?.[0] ?? 'Validation error' });
                });
            } else if (status === 409) {
                setError('email', { type: 'server', message: 'This email is already registered' });
            } else {
                alert('Something went wrong. Please try again.');
            }
        }
    };

    const handleClose = () => {
        setForm({
            email: '',
            password: '',
            displayName: '',
            dateOfBirth: '',
            gender: Gender.NotSpecified, // И здесь тоже
            acceptTerms: true,
            acceptMarketing: false,
            accountState: AccountState.Active,
            roleIds: [],
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content bg-admin-primary border border-secondary shadow-lg text-white">

                    <div className="modal-header border-secondary p-4">
                        <h5 className="modal-title fw-bold">Create New User</h5>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            onClick={() => { onClose(); reset(); }}
                        />
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="modal-body p-4">

                            {/* Email + Password */}
                            <div className="row">
                                <div className="col-md-6 mb-3">
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

                                <div className="col-md-6 mb-3">
                                    <label className="form-label admin-text small fw-bold">PASSWORD *</label>
                                    <input
                                        type="password"
                                        placeholder="Min 8 chars, A-Z, a-z, 0-9"
                                        className={`form-control admin-login__input ${errors.password ? 'is-invalid' : ''}`}
                                        {...register('password', {
                                            required: 'Password is required',
                                            minLength: { value: 8, message: 'Min 8 characters' },
                                            maxLength: { value: 100, message: 'Max 100 characters' },
                                            validate: (v) => {
                                                if (!/[A-Z]/.test(v)) return 'Must include an uppercase letter';
                                                if (!/[a-z]/.test(v)) return 'Must include a lowercase letter';
                                                if (!/[0-9]/.test(v)) return 'Must include a digit';
                                                return true;
                                            },
                                        })}
                                    />
                                    {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                                </div>

                            {/* Display Name + Date of Birth */}
                            <div className="row">
                                <div className="col-md-6 mb-3">
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

                            {/* Gender + Account State */}
                            <div className="row">
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

                                <div className="col-md-6 mb-3">
                                    <label className="form-label admin-text small fw-bold">ACCOUNT STATE</label>
                                    <select
                                        className="form-select admin-login__input text-white"
                                        {...register('accountState')}
                                    >
                                        <option value={AccountState.Active}>Active</option>
                                        <option value={AccountState.Banned}>Banned</option>
                                    </select>
                                </div>
                            </div>

                            {/* Role — динамически из API */}
                            <div className="mb-3">
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

                            {/* Checkboxes */}
                            <div className="d-flex flex-column gap-2 mt-2">
                                <div className="form-check">
                                    <input
                                        className={`form-check-input ${errors.acceptTerms ? 'is-invalid' : ''}`}
                                        type="checkbox"
                                        id="create-terms"
                                        {...register('acceptTerms', {
                                            validate: (v) => v === true || 'Must accept Terms & Conditions',
                                        })}
                                    />
                                    <label className="form-check-label small" htmlFor="create-terms">
                                        Accept Terms & Conditions <span className="text-danger">*</span>
                                    </label>
                                    {errors.acceptTerms && (
                                        <div className="invalid-feedback d-block">{errors.acceptTerms.message}</div>
                                    )}
                                </div>

                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="create-marketing"
                                        {...register('acceptMarketing')}
                                    />
                                    <label className="form-check-label small" htmlFor="create-marketing">
                                        Accept Marketing Emails
                                    </label>
                                </div>
                            </div>

                        </div>

                        <div className="modal-footer border-0 p-4">
                            <button
                                type="button"
                                className="btn btn-admin-dark px-4"
                                onClick={() => { onClose(); reset(); }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary px-5 fw-bold"
                                disabled={isPending || isSubmitting}
                            >
                                {(isPending || isSubmitting)
                                    ? <><span className="spinner-border spinner-border-sm me-2" />Creating...</>
                                    : 'Create User'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
