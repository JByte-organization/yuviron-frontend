'use client';

import React, { useState } from 'react';
import { useDeleteApiAdminBannersId, type BannerListItemDto } from '@repo/api/admin.ts';

interface Props {
    banner: BannerListItemDto | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const DeleteBannerModal = ({ banner, isOpen, onClose, onSuccess }: Props) => {
    const { mutateAsync: deleteBanner, isPending } = useDeleteApiAdminBannersId();

    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const triggerSuccess = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => {
            setSuccessMessage(null);
            onSuccess();
            onClose();
        }, 3000);
    };

    const handleDelete = async () => {
        if (!banner?.id) return;
        try {
            await deleteBanner({ id: banner.id });

            triggerSuccess(banner.title ? `Банер "${banner.title}" успішно видалено` : 'Банер успішно видалено');
        } catch {
            alert('Не вдалося видалити банер.');
        }
    };

    if (!isOpen || !banner) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 420 }}>
                <div className="modal-content bg-admin-primary border border-secondary shadow-lg text-white">

                    <div className="modal-header border-secondary p-4">
                        <h5 className="modal-title fw-bold text-danger">Delete Banner</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose} disabled={isPending} />
                    </div>

                    <div className="modal-body p-4" style={{ overflowY: 'auto', maxHeight: '70vh' }}>
                        <p className="text-secondary mb-1">
                            Are you sure you want to delete this banner?
                        </p>
                        <p className="text-white fw-semibold mb-0">
                            {banner.title ? `"${banner.title}"` : 'Untitled Campaign'}
                        </p>
                        <p className="text-danger small mt-3 mb-0">
                            This action cannot be undone.
                        </p>
                    </div>

                    <div className="modal-footer border-0 p-4">
                        <button type="button" className="btn btn-admin-dark px-4" onClick={onClose} disabled={isPending}>
                            Cancel
                        </button>
                        <button type="button" className="btn btn-danger px-5 fw-bold" onClick={handleDelete} disabled={isPending}>
                            {isPending ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            </div>

            {successMessage && (
                <div className="yuviron-alert alert-success-toast">
                    <i className="bi bi-check-circle-fill alert-icon" />
                    <div className="alert-content">{successMessage}</div>
                </div>
            )}
        </div>
    );
};