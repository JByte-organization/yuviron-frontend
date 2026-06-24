'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import {
    useGetApiAdminComplaintsId,
    usePostApiAdminComplaintsIdApprove,
    usePostApiAdminComplaintsIdReject,
    getGetApiAdminComplaintsIdQueryKey,
    type ComplaintListItemDto,
    type ComplaintDetailsDto
} from '@repo/api/admin.ts';

interface ReviewModalProps {
    complaint: ComplaintListItemDto;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type FormValues = {
    adminNote: string;
};

export const ReviewComplaintModal = ({ complaint, isOpen, onClose, onSuccess }: ReviewModalProps) => {
    const complaintId = complaint.id ?? '';
    const queryClient = useQueryClient();
    const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');

    const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<FormValues>({
        defaultValues: { adminNote: '' }
    });

    // Получаем фулл данные по жалобе
    const { data: detailsRaw, isLoading } = useGetApiAdminComplaintsId(complaintId, {
        query: {
            queryKey: getGetApiAdminComplaintsIdQueryKey(complaintId),
            enabled: isOpen && !!complaintId
        }
    });
    const details = (detailsRaw as { data?: ComplaintDetailsDto } | undefined)?.data ?? (detailsRaw as ComplaintDetailsDto | undefined);

    const { mutateAsync: approveComplaint, isPending: isApprovePending } = usePostApiAdminComplaintsIdApprove();
    const { mutateAsync: rejectComplaint, isPending: isRejectPending } = usePostApiAdminComplaintsIdReject();

    const onSubmit = async (values: FormValues) => {
        try {
            const payload = {
                id: complaintId,
                data: { adminNote: values.adminNote.trim() || null }
            };

            if (actionType === 'approve') {
                await approveComplaint(payload);
            } else {
                await rejectComplaint(payload);
            }

            await queryClient.invalidateQueries({ queryKey: getGetApiAdminComplaintsIdQueryKey(complaintId) });
            onSuccess();
            onClose();
            reset();
        } catch {
            setError('root', { message: 'Failed to submit moderation decision context.' });
        }
    };

    if (!isOpen) return null;

    const isPending = isApprovePending || isRejectPending || isSubmitting;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content bg-admin-primary border border-secondary shadow-lg text-white">
                    <div className="modal-header border-secondary p-4">
                        <div>
                            <h5 className="modal-title fw-bold text-cyan mb-0">Review Moderation Ticket</h5>
                            <small className="text-secondary">Complaint ID: {complaintId}</small>
                        </div>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose} />
                    </div>

                    {isLoading ? (
                        <div className="modal-body p-5 text-center">
                            <div className="spinner-border text-info" />
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="modal-body p-4 d-flex flex-column gap-3" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                                {errors.root && <div className="alert alert-danger py-2 small">{errors.root.message}</div>}

                                <div className="bg-dark p-3 rounded border border-secondary small d-flex flex-column gap-2">
                                    <div><span className="text-secondary fw-bold">TARGET TYPE:</span> <span className="text-cyan font-monospace">{details?.targetType}</span></div>
                                    <div><span className="text-secondary fw-bold">TARGET ID:</span> <span className="text-white font-monospace text-break">{details?.targetId}</span></div>
                                    <div><span className="text-secondary fw-bold">REASON CODE:</span> <span className="text-white fw-bold">{details?.reasonCode || 'General'}</span></div>
                                    <div><span className="text-secondary fw-bold">USER COMMENT:</span> <p className="text-white-50 mt-1 mb-0 italic">"{details?.comment || 'No comment provided'}"</p></div>
                                    <div className="border-top border-secondary pt-2 mt-1">
                                        <span className="text-secondary fw-bold">TOTAL COMPLAINTS FOR TARGET:</span> <span className="badge bg-danger ms-2">{details?.totalComplaintsForTarget ?? 0}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="form-label text-secondary small fw-bold">ADMIN MODERATION NOTE</label>
                                    <textarea
                                        className="form-control admin-login__input text-white"
                                        rows={3}
                                        placeholder="Provide justification for logs..."
                                        {...register('adminNote')}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer border-secondary p-4 d-flex justify-content-between">
                                <button type="button" className="btn btn-admin-dark px-4" onClick={onClose} disabled={isPending}>Cancel</button>
                                <div className="d-flex gap-2">
                                    <button
                                        type="submit"
                                        className="btn btn-danger px-4 fw-bold"
                                        disabled={isPending}
                                        onClick={() => setActionType('reject')}
                                    >
                                        Reject Complaint
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-success px-4 fw-bold"
                                        disabled={isPending}
                                        onClick={() => setActionType('approve')}
                                    >
                                        Approve Violation
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};