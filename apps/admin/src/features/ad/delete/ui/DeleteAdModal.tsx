'use client';

import React from 'react';
import { useDeleteApiAdminAdsId, type AdSummaryDto } from '@repo/api/admin.ts';

interface DeleteAdModalProps {
    ad: AdSummaryDto | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const DeleteAdModal = ({ ad, isOpen, onClose, onSuccess }: DeleteAdModalProps) => {
    const { mutateAsync: deleteAd, isPending } = useDeleteApiAdminAdsId();

    const handleDelete = async () => {
        if (!ad?.id) return;
        try {
            // Отправляем ID удаляемой рекламы согласно контракту API
            await deleteAd({ id: ad.id });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to terminate advertisement campaign.', error);
        }
    };

    if (!isOpen || !ad) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 420 }}>
                <div className="modal-content bg-admin-primary border border-secondary shadow-lg text-white">

                    <div className="modal-header border-secondary p-4">
                        <h5 className="modal-title fw-bold text-danger">Delete Campaign</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose} />
                    </div>

                    <div className="modal-body p-4" style={{ overflowY: 'auto', maxHeight: '70vh' }}>
                        <p className="text-secondary mb-1">
                            Are you sure you want to completely remove this audio advertisement?
                        </p>
                        <p className="text-white fw-semibold mb-0">
                            {ad.advertiserName ? `"${ad.advertiserName} — ${ad.title}"` : 'Selected Ad Campaign'}
                        </p>
                        <p className="text-danger small mt-3 mb-0">
                            This action is destructive and cannot be undone.
                        </p>
                    </div>

                    <div className="modal-footer border-0 p-4">
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
                            {isPending ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};