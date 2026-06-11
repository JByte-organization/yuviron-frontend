'use client';

import React from 'react';
import { useDeleteApiAdminGenresId, type GenreListItemDto } from '@repo/api/admin.ts';

interface Props {
    genre: GenreListItemDto | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const DeleteGenreModal = ({ genre, isOpen, onClose, onSuccess }: Props) => {
    const { mutateAsync: deleteGenre, isPending } = useDeleteApiAdminGenresId();

    const handleDelete = async () => {
        if (!genre?.id) return;

        try {
            await deleteGenre({ id: genre.id });
            onSuccess();
            onClose();
        } catch (error: any) {
            const status = error.response?.status;
            alert(`Error ${status}: Failed to delete genre.`);
        }
    };

    if (!isOpen || !genre) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered modal-sm">
                <div className="modal-content bg-admin-primary border border-danger shadow-lg text-white">

                    <div className="modal-header border-secondary p-4">
                        <h5 className="modal-title fw-bold text-danger">Delete Genre</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose} />
                    </div>

                    <div className="modal-body p-4 text-center">
                        <div className="mb-3" style={{ fontSize: '2.5rem' }}>🗑️</div>
                        <p className="text-white mb-1">Are you sure you want to delete</p>
                        <p className="fw-bold text-danger fs-5 mb-1">"{genre.name}"</p>
                        <p className="text-secondary small">This action cannot be undone.</p>
                    </div>

                    <div className="modal-footer border-0 p-4 d-flex gap-2">
                        <button
                            type="button"
                            className="btn btn-admin-dark px-4 flex-fill"
                            onClick={onClose}
                            disabled={isPending}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-danger px-4 flex-fill fw-bold"
                            onClick={handleDelete}
                            disabled={isPending}
                        >
                            {isPending ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};