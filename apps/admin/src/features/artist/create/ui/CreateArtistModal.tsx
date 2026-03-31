'use client';

import React, { useState } from 'react';
import { usePostApiAdminArtists } from '@repo/api';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateArtistModal = ({ isOpen, onClose, onSuccess }: Props) => {
    const [form, setForm] = useState({
        name: '',
        description: '',
        imageUrl: '',
        isVerified: false
    });

    const { mutate, isPending } = usePostApiAdminArtists({
        mutation: {
            onSuccess: () => {
                onSuccess();
                onClose();
                setForm({ name: '', description: '', imageUrl: '', isVerified: false });
            },
            onError: (err: any) => alert('Error: ' + JSON.stringify(err))
        }
    });

    if (!isOpen) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content bg-admin-primary border border-secondary text-white">
                    <div className="modal-header border-secondary p-4">
                        <h5 className="modal-title fw-bold">Add New Artist</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); mutate({ data: form }); }}>
                        <div className="modal-body p-4">
                            <div className="mb-3">
                                <label className="form-label admin-text small fw-bold">ARTIST NAME</label>
                                <input type="text" className="form-control admin-login__input" required
                                       value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label admin-text small fw-bold">DESCRIPTION</label>
                                <textarea className="form-control admin-login__input" rows={3}
                                          value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                            </div>
                            <div className="form-check form-switch mb-3">
                                <input className="form-check-input" type="checkbox" id="verifySwitch"
                                       checked={form.isVerified} onChange={e => setForm({...form, isVerified: e.target.checked})} />
                                <label className="form-check-label" htmlFor="verifySwitch">Verified Artist</label>
                            </div>
                        </div>
                        <div className="modal-footer border-0 p-4 pt-0">
                            <button type="submit" className="btn btn-primary w-100 py-2 fw-bold" disabled={isPending}>
                                {isPending ? 'Saving...' : 'Create Artist'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};