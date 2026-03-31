'use client';

import React, { useState } from 'react';
import { usePostApiAdminTracks } from '@repo/api';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateTrackModal = ({ isOpen, onClose, onSuccess }: Props) => {
    const [form, setForm] = useState({
        title: '',
        artistId: '',
        genreId: '',
        fileUrl: '', // В идеале тут будет File upload
        coverUrl: '',
    });

    const { mutate, isPending } = usePostApiAdminTracks({
        mutation: {
            onSuccess: () => {
                onSuccess();
                onClose();
                setForm({ title: '', artistId: '', genreId: '', fileUrl: '', coverUrl: '' });
            },
            onError: (err: any) => alert('Error: ' + JSON.stringify(err))
        }
    });

    if (!isOpen) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content bg-admin-primary border border-secondary text-white">
                    <div className="modal-header border-secondary p-4">
                        <h5 className="modal-title fw-bold">Upload New Track</h5>
                        <button type="button" className="btn-close btn-close-white shadow-none" onClick={onClose}></button>
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); mutate({ data: form }); }}>
                        <div className="modal-body p-4">
                            <div className="row">
                                <div className="col-md-12 mb-3">
                                    <label className="form-label admin-text small fw-bold">TRACK TITLE</label>
                                    <input type="text" className="form-control admin-login__input" required
                                           value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label admin-text small fw-bold">ARTIST ID</label>
                                    <input type="text" className="form-control admin-login__input" required
                                           value={form.artistId} onChange={e => setForm({...form, artistId: e.target.value})} />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label admin-text small fw-bold">GENRE ID</label>
                                    <input type="text" className="form-control admin-login__input" required
                                           value={form.genreId} onChange={e => setForm({...form, genreId: e.target.value})} />
                                </div>
                                <div className="col-md-12 mb-3">
                                    <label className="form-label admin-text small fw-bold">AUDIO FILE URL</label>
                                    <input type="text" className="form-control admin-login__input"
                                           placeholder="https://storage.com/track.mp3"
                                           value={form.fileUrl} onChange={e => setForm({...form, fileUrl: e.target.value})} />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer border-0 p-4">
                            <button type="button" className="btn btn-admin-dark px-4" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn btn-primary px-5 fw-bold" disabled={isPending}>
                                {isPending ? 'Uploading...' : 'Save Track'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};