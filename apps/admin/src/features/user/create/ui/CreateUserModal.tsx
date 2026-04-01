'use client';

import React, { useState } from 'react';
import {
    usePostApiAdminUsers,
    Gender,
    AccountState,
    CreateUserCommand
} from '@repo/api';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateUserModal = ({ isOpen, onClose, onSuccess }: Props) => {
    // Инициализируем форму с правильным ключом NotSpecified
    const [form, setForm] = useState<CreateUserCommand>({
        email: '',
        password: '',
        displayName: '',
        dateOfBirth: '',
        gender: Gender.NotSpecified, // ЗАМЕНЕНО: было None, теперь NotSpecified
        acceptTerms: true,
        acceptMarketing: false,
        accountState: AccountState.Active,
        roleIds: [],
    });

    const { mutate, isPending } = usePostApiAdminUsers({
        mutation: {
            onSuccess: () => {
                onSuccess();
                handleClose();
                alert('User created successfully!');
            },
            onError: (err: any) => {
                const errorMessage = err.response?.data?.errors
                    ? JSON.stringify(err.response.data.errors)
                    : err.message || 'Unknown error';
                alert('Error: ' + errorMessage);
            }
        }
    });

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
        <div className="modal d-block shadow" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content bg-dark border-secondary shadow-lg text-white">
                    <div className="modal-header border-secondary p-4">
                        <h5 className="modal-title fw-bold text-uppercase tracking-wider">Create Professional User</h5>
                        <button type="button" className="btn-close btn-close-white shadow-none" onClick={handleClose}></button>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); mutate({ data: form }); }}>
                        <div className="modal-body p-4">
                            <div className="row g-3">
                                {/* Email */}
                                <div className="col-md-6 mb-2">
                                    <label className="form-label text-secondary small fw-bold">EMAIL</label>
                                    <input type="email" className="form-control bg-transparent border-secondary text-white shadow-none"
                                           value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} required />
                                </div>
                                {/* Password */}
                                <div className="col-md-6 mb-2">
                                    <label className="form-label text-secondary small fw-bold">PASSWORD</label>
                                    <input type="password" underline-none="true" className="form-control bg-transparent border-secondary text-white shadow-none"
                                           value={form.password || ''} onChange={e => setForm({...form, password: e.target.value})} required />
                                </div>

                                {/* Display Name */}
                                <div className="col-md-6 mb-2">
                                    <label className="form-label text-secondary small fw-bold">DISPLAY NAME</label>
                                    <input type="text" className="form-control bg-transparent border-secondary text-white shadow-none"
                                           value={form.displayName || ''} onChange={e => setForm({...form, displayName: e.target.value})} />
                                </div>
                                {/* Date of Birth */}
                                <div className="col-md-6 mb-2">
                                    <label className="form-label text-secondary small fw-bold">DATE OF BIRTH</label>
                                    <input type="date" className="form-control bg-transparent border-secondary text-white shadow-none"
                                           value={form.dateOfBirth || ''} onChange={e => setForm({...form, dateOfBirth: e.target.value})} />
                                </div>

                                {/* Gender - Используем правильные ключи из твоего типа */}
                                <div className="col-md-6 mb-2">
                                    <label className="form-label text-secondary small fw-bold">GENDER</label>
                                    <select
                                        className="form-select bg-dark border-secondary text-white shadow-none"
                                        value={form.gender}
                                        onChange={e => setForm({...form, gender: e.target.value as Gender})}
                                    >
                                        <option value={Gender.NotSpecified}>Not Specified</option>
                                        <option value={Gender.Male}>Male</option>
                                        <option value={Gender.Female}>Female</option>
                                        <option value={Gender.NonBinary}>Non Binary</option>
                                        <option value={Gender.Other}>Other</option>
                                    </select>
                                </div>

                                {/* Roles */}
                                <div className="col-md-6 mb-2">
                                    <label className="form-label text-secondary small fw-bold">ROLE</label>
                                    <select
                                        className="form-select bg-dark border-secondary text-white shadow-none"
                                        onChange={e => setForm({...form, roleIds: e.target.value ? [e.target.value] : []})}
                                    >
                                        <option value="">Select Role</option>
                                        <option value="admin">Admin</option>
                                        <option value="manager">Manager</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="form-check mb-2">
                                    <input className="form-check-input bg-transparent border-secondary shadow-none" type="checkbox" id="terms" checked={form.acceptTerms}
                                           onChange={e => setForm({...form, acceptTerms: e.target.checked})} />
                                    <label className="form-check-label small text-secondary" htmlFor="terms">Accept Terms & Conditions</label>
                                </div>
                                <div className="form-check">
                                    <input className="form-check-input bg-transparent border-secondary shadow-none" type="checkbox" id="marketing" checked={form.acceptMarketing}
                                           onChange={e => setForm({...form, acceptMarketing: e.target.checked})} />
                                    <label className="form-check-label small text-secondary" htmlFor="marketing">Accept Marketing Emails</label>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer border-secondary p-4 pt-0">
                            <button type="button" className="btn btn-outline-secondary px-4 border-0" onClick={handleClose}>Cancel</button>
                            <button type="submit" className="btn btn-primary px-5 fw-bold" disabled={isPending}>
                                {isPending ? 'Saving...' : 'Create User'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};