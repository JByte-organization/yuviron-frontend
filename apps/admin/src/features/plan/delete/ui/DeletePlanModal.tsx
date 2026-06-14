'use client';

import React from 'react';
import { useDeleteApiAdminPlansId, type PlanListItemDto } from '@repo/api/admin.ts';

interface DeletePlanModalProps {
    plan: PlanListItemDto;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const DeletePlanModal = ({ plan, isOpen, onClose, onSuccess }: DeletePlanModalProps) => {
    const { mutateAsync: deletePlan, isPending } = useDeleteApiAdminPlansId();

    const handleDelete = async () => {
        if (!plan.id) return;
        try {
            await deletePlan({ id: plan.id });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to eliminate billing plan entity.', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 420 }}>
                <div className="modal-content bg-admin-primary border border-secondary shadow-lg text-white">
                    <div className="modal-header border-secondary p-4">
                        <h5 className="modal-title fw-bold text-danger">Terminate Subscription Plan</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose} />
                    </div>

                    <div className="modal-body p-4">
                        <p className="text-secondary mb-1">Are you sure you want to completely remove this tariff level?</p>
                        <p className="text-white fw-bold mb-0">"{plan.name || 'Selected Plan'}"</p>
                        <p className="text-danger small mt-3 mb-0">Warning: Active subscribers might experience pipeline detachment. This cannot be undone.</p>
                    </div>

                    <div className="modal-footer border-0 p-4">
                        <button type="button" className="btn btn-admin-dark px-4" onClick={onClose} disabled={isPending}>Cancel</button>
                        <button type="button" className="btn btn-danger px-5 fw-bold" onClick={handleDelete} disabled={isPending}>
                            {isPending ? 'Terminating...' : 'Delete Tier'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};