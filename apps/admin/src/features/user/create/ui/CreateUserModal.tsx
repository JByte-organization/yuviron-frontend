'use client';

import React, { useState } from 'react';
import { usePostApiAdminUsers } from '@repo/api';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateUserModal = ({ isOpen, onClose, onSuccess }: Props) => {
    // Состояние на базе CreateUserCommand
    const [form, setForm] = useState({
        email: '',
        password: '',
        displayName: '',
        dateOfBirth: '',
        gender: 0, // Предположим 0 - NotSpecified, 1 - Male, 2 - Female
        acceptTerms: true,
        acceptMarketing: false,
        accountState: 1, // Обычно 1 - Active
        roleIds: [] as string[],
    });

    const { mutate, isPending } = usePostApiAdminUsers({
        mutation: {
            onSuccess: () => {
                onSuccess();
                onClose();
                alert('User created successfully!');
            },
            onError: (err: any) => alert('Error: ' + JSON.stringify(err.data?.errors || err))
        }
    });

    if (!isOpen) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content bg-admin-primary border border-secondary shadow-lg text-white">
                    <div className="modal-header border-secondary p-4">
                        <h5 className="modal-title fw-bold">Create Professional User</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); mutate({ data: form }); }}>
                        <div className="modal-body p-4">
                            <div className="row">
                                {/* Email */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label admin-text small fw-bold">EMAIL</label>
                                    <input type="email" className="form-control admin-login__input"
                                           value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                                </div>
                                {/* Password */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label admin-text small fw-bold">PASSWORD</label>
                                    <input type="password" className="form-control admin-login__input"
                                           value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
                                </div>
                            </div>

                            <div className="row">
                                {/* Display Name */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label admin-text small fw-bold">DISPLAY NAME</label>
                                    <input type="text" className="form-control admin-login__input"
                                           value={form.displayName} onChange={e => setForm({...form, displayName: e.target.value})} />
                                </div>
                                {/* Date of Birth */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label admin-text small fw-bold">DATE OF BIRTH</label>
                                    <input type="date" className="form-control admin-login__input"
                                           value={form.dateOfBirth} onChange={e => setForm({...form, dateOfBirth: e.target.value})} />
                                </div>
                            </div>

                            <div className="row">
                                {/* Gender */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label admin-text small fw-bold">GENDER</label>
                                    <select className="form-select admin-login__input text-white"
                                            value={form.gender} onChange={e => setForm({...form, gender: Number(e.target.value)})}>
                                        <option value={0}>Not Specified</option>
                                        <option value={1}>Male</option>
                                        <option value={2}>Female</option>
                                    </select>
                                </div>
                                {/* Roles (Упрощенно) */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label admin-text small fw-bold">ROLE</label>
                                    <select className="form-select admin-login__input text-white"
                                            onChange={e => setForm({...form, roleIds: [e.target.value]})}>
                                        <option value="">Select Role</option>
                                        <option value="admin-id-from-db">Admin</option>
                                        <option value="manager-id-from-db">Manager</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-3">
                                <div className="form-check mb-2">
                                    <input className="form-check-input" type="checkbox" id="terms" checked={form.acceptTerms}
                                           onChange={e => setForm({...form, acceptTerms: e.target.checked})} />
                                    <label className="form-check-label small" htmlFor="terms">Accept Terms & Conditions</label>
                                </div>
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" id="marketing" checked={form.acceptMarketing}
                                           onChange={e => setForm({...form, acceptMarketing: e.target.checked})} />
                                    <label className="form-check-label small" htmlFor="marketing">Accept Marketing Emails</label>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer border-0 p-4">
                            <button type="button" className="btn btn-admin-dark px-4" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn btn-primary px-5 fw-bold" disabled={isPending}>
                                {isPending ? 'Creating...' : 'Create User'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};