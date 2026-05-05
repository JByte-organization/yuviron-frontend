'use client';

import React from 'react';
import {
    useDeleteApiAdminArtistsId,
    type ArtistListItemDto,
} from '@repo/api';

interface Props {
    artist: ArtistListItemDto | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const DeleteArtistModal = ({ artist, isOpen, onClose, onSuccess }: Props) => {
    // Используем хук удаления артиста по ID
    const { mutateAsync, isPending } = useDeleteApiAdminArtistsId();

    const handleDelete = async () => {
        if (!artist?.id) return;
        try {
            await mutateAsync({ id: artist.id });
            onSuccess();
            onClose();
        } catch (error: any) {
            if (error.response?.status === 404) {
                alert('Artist not found — may already be deleted.');
                onClose();
            } else {
                alert('Failed to delete artist. Please try again.');
            }
        }
    };

    if (!isOpen || !artist) return null;

    const isVerified = artist.verificationStatus === 'Verified';
    const avatarSrc = artist.avatarUrl
        ? `https://api.yuviron.com/storage/${artist.avatarUrl}`
        : null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '460px' }}>
                <div className="modal-content bg-admin-primary border border-danger shadow-lg text-white">

                    <div className="modal-header border-secondary p-4">
                        <h5 className="modal-title fw-bold text-danger">Delete Artist Profile</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose} />
                    </div>

                    <div className="modal-body p-4">
                        {/* Превью артиста */}
                        <div
                            className="d-flex align-items-center gap-3 p-3 rounded-3 mb-4"
                            style={{
                                backgroundColor: 'rgba(220,53,69,0.08)',
                                border: '1px solid rgba(220,53,69,0.25)',
                            }}
                        >
                            <div
                                className="rounded-circle bg-secondary d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0"
                                style={{ width: '48px', height: '48px' }}
                            >
                                {avatarSrc
                                    ? <img src={avatarSrc} alt="avatar" className="w-100 h-100 object-fit-cover" />
                                    : <span className="fw-bold text-white">
                                        {artist.name?.charAt(0)?.toUpperCase() || '?'}
                                    </span>
                                }
                            </div>
                            <div className="overflow-hidden">
                                <div className="fw-bold text-white text-truncate">{artist.name || 'Unknown Artist'}</div>
                                <div className="small text-secondary text-truncate">{artist.ownerEmail}</div>
                                <div className="d-flex align-items-center gap-1 mt-1">
                                    <span
                                        className={`rounded-circle ${isVerified ? 'bg-success' : 'bg-warning'}`}
                                        style={{ width: '6px', height: '6px', flexShrink: 0 }}
                                    />
                                    <small className={isVerified ? 'text-success' : 'text-warning'}>
                                        {artist.verificationStatus}
                                    </small>
                                </div>
                            </div>
                        </div>

                        <p className="mb-1">Are you sure you want to <strong>permanently delete</strong> this artist profile?</p>
                        <p className="text-danger small mb-0">This will remove all associated profile data. This action cannot be undone.</p>
                    </div>

                    <div className="modal-footer border-0 p-4 gap-2">
                        <button
                            type="button"
                            className="btn btn-admin-dark px-4"
                            onClick={onClose}
                            disabled={isPending}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-danger px-5 fw-bold"
                            onClick={handleDelete}
                            disabled={isPending}
                        >
                            {isPending
                                ? <><span className="spinner-border spinner-border-sm me-2" />Deleting...</>
                                : 'Yes, Delete'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};