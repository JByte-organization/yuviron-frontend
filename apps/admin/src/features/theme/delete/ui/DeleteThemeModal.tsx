'use client';

import React from 'react';
import { useDeleteApiAdminThemesId, type ThemeListItemDto } from '@repo/api/admin.ts';

interface Props { theme: ThemeListItemDto; isOpen: boolean; onClose: () => void; onSuccess: () => void; }

export const DeleteThemeModal = ({ theme, isOpen, onClose, onSuccess }: Props) => {
    const { mutateAsync: deleteTheme, isPending } = useDeleteApiAdminThemesId();

    const handleDelete = async () => {
        if (!theme.id) return;
        try {
            await deleteTheme({ id: theme.id });
            onSuccess();
            onClose();
        } catch {
            alert('Could not truncate layout profile node.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 440 }}>
                <div className="modal-content bg-admin-primary border border-secondary text-white shadow-lg">
                    <div className="modal-header border-secondary p-4">
                        <h5 className="modal-title fw-bold text-danger">Purge Ambient Theme</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose} disabled={isPending} />
                    </div>

                    <div className="modal-body p-4">
                        <p className="text-secondary mb-1">Are you sure you want to completely erase this theme?</p>
                        <p className="text-white fw-bold h5 mb-0">"{theme.name || 'Untitled Scheme'}"</p>
                        <p className="text-danger small mt-3 mb-0">🚨 Warning: Active premium user universes running this node ID will fallback to baseline black void configurations immediately.</p>
                    </div>

                    <div className="modal-footer border-0 p-4">
                        <button type="button" className="btn btn-admin-dark px-4" onClick={onClose} disabled={isPending}>Cancel</button>
                        <button type="button" className="btn btn-danger px-5 fw-bold" onClick={handleDelete} disabled={isPending}>
                            {isPending ? 'Purging...' : 'Delete Theme'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};