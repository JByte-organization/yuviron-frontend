'use client';

import React from 'react';
import {
    useDeleteApiAdminUsersId,
    AccountState,
    type UserListItemDto,
} from '@repo/api/admin.ts';

interface Props {
    user: UserListItemDto | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const DeleteUserModal = ({ user, isOpen, onClose, onSuccess }: Props) => {
    const { mutateAsync, isPending } = useDeleteApiAdminUsersId();

    const handleDelete = async () => {
        if (!user?.id) return;
        try {
            await mutateAsync({ id: user.id });
            onSuccess();
            onClose();
        } catch (error: any) {
            if (error.response?.status === 404) {
                alert('User not found — may already be deleted.');
                onClose();
            } else {
                alert('Failed to delete user. Please try again.');
            }
        }
    };

    if (!isOpen || !user) return null;

    const isActive = user.accountState === AccountState.Active;
    const avatarSrc = user.avatarUrl
        ? `https://api.yuviron.com/storage/${user.avatarUrl}`
        : null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '460px' }}>
                <div className="modal-content bg-admin-primary border border-danger shadow-lg text-white">

                    <div className="modal-header border-secondary p-4">
                        <h5 className="modal-title fw-bold text-danger">Delete User</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose} />
                    </div>

                    <div className="modal-body p-4">
                        {/* Превью юзера */}
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
                                        {user.firstName?.charAt(0)?.toUpperCase() || '?'}
                                    </span>
                                }
                            </div>
                            <div className="overflow-hidden">
                                <div className="fw-bold text-white text-truncate">{user.firstName || 'No Name'}</div>
                                <div className="small text-secondary text-truncate">{user.email}</div>
                                <div className="d-flex align-items-center gap-1 mt-1">
                                    <span
                                        className={`rounded-circle ${isActive ? 'bg-success' : 'bg-danger'}`}
                                        style={{ width: '6px', height: '6px', flexShrink: 0 }}
                                    />
                                    <small className={isActive ? 'text-success' : 'text-danger'}>
                                        {user.accountState}
                                    </small>
                                </div>
                            </div>
                        </div>

                        <p className="mb-1">Are you sure you want to <strong>permanently delete</strong> this user?</p>
                        <p className="text-danger small mb-0">This action cannot be undone.</p>
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
