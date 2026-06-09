'use client';

import React, { useState } from 'react';
import {
    useGetApiAdminFinancePayoutsId,
    getGetApiAdminFinancePayoutsIdQueryKey,
    usePostApiAdminFinancePayoutsIdApprove,
    usePostApiAdminFinancePayoutsIdReject,
    type PayoutRequestDetailsDto
} from '@repo/api/admin';

interface PayoutDetailsModalProps {
    payoutId: string | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const PayoutDetailsModal = ({ payoutId, isOpen, onClose, onSuccess }: PayoutDetailsModalProps) => {
    const [actionType, setActionType] = useState<'none' | 'approve' | 'reject'>('none');
    const [providerReferenceId, setProviderReferenceId] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Отримання деталей за суворим queryKey ключем
    const { data: detailsRaw, isLoading } = useGetApiAdminFinancePayoutsId(payoutId ?? '', {
        query: {
            queryKey: getGetApiAdminFinancePayoutsIdQueryKey(payoutId ?? ''),
            enabled: isOpen && !!payoutId,
        }
    });

    // Чисте розпакування без any
    const details = (detailsRaw as { data?: PayoutRequestDetailsDto } | undefined)?.data
        ?? (detailsRaw as PayoutRequestDetailsDto | undefined);

    const { mutateAsync: approvePayout, isPending: isApproving } = usePostApiAdminFinancePayoutsIdApprove();
    const { mutateAsync: rejectPayout, isPending: isRejecting } = usePostApiAdminFinancePayoutsIdReject();

    const handleClose = () => {
        setActionType('none');
        setProviderReferenceId('');
        setRejectReason('');
        setSubmitError(null);
        onClose();
    };

    const handleApproveSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!payoutId || !providerReferenceId.trim()) return;
        setSubmitError(null);

        try {
            await approvePayout({
                id: payoutId,
                data: { providerReferenceId: providerReferenceId.trim() } as Parameters<typeof approvePayout>[0]['data']
            });
            onSuccess();
            handleClose();
        } catch {
            setSubmitError('Unable to confirm payment. Please check your details.');
        }
    };

    const handleRejectSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!payoutId || !rejectReason.trim()) return;
        setSubmitError(null);

        try {
            await rejectPayout({
                id: payoutId,
                data: { reason: rejectReason.trim() } as Parameters<typeof rejectPayout>[0]['data']
            });
            onSuccess();
            handleClose();
        } catch {
            setSubmitError('Failed to reject your request. Please check your connection.');
        }
    };

    if (!isOpen || !payoutId) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
            <div className="modal-dialog modal-md modal-dialog-centered">
                <div className="modal-content bg-admin-primary border border-secondary shadow-lg text-white">

                    <div className="modal-header border-secondary p-4">
                        <div>
                            <h5 className="modal-title fw-bold text-cyan mb-0">Processing withdrawal request</h5>
                            <small className="text-secondary">Application ID: {payoutId}</small>
                        </div>
                        <button type="button" className="btn-close btn-close-white" onClick={handleClose} />
                    </div>

                    {isLoading ? (
                        <div className="modal-body p-5 text-center">
                            <div className="spinner-border text-info" />
                            <p className="text-secondary mt-3">Loading payment details...</p>
                        </div>
                    ) : (
                        <div className="modal-body p-4">
                            {/* Інформаційна сітка фінансового стану */}
                            <div className="p-3 rounded mb-4" style={{ backgroundColor: '#1a1f29', border: '1px solid #2d3748' }}>
                                <div className="row g-3">
                                    <div className="col-6">
                                        <span className="text-secondary small d-block">ARTIST</span>
                                        <span className="fw-semibold text-white">{details?.artistName ?? '—'}</span>
                                    </div>
                                    <div className="col-6">
                                        <span className="text-secondary small d-block">WITHDRAWAL AMOUNT</span>
                                        <span className="fw-bold text-cyan fs-5">${details?.requestedAmount ?? '0.00'}</span>
                                    </div>
                                    <div className="col-6">
                                        <span className="text-secondary small d-block">SYSTEM METHOD</span>
                                        <span className="badge bg-primary mt-1">{details?.payoutMethod ?? 'PayPal'}</span>
                                    </div>
                                    <div className="col-6">
                                        <span className="text-secondary small d-block">TRUST (TOTAL EARNED)</span>
                                        <span className="text-info fw-semibold">${details?.artistTotalEarned ?? '0.00'}</span>
                                    </div>
                                    <div className="col-6 border-top border-secondary pt-2">
                                        <span className="text-success small d-block">AVAILABLE BALANCE</span>
                                        <span className="text-success fw-semibold">${details?.artistAvailableBalance ?? '0.00'}</span>
                                    </div>
                                    <div className="col-6 border-top border-secondary pt-2">
                                        <span className="text-warning small d-block">HELD BALANCE</span>
                                        <span className="text-warning fw-semibold">${details?.artistHeldBalance ?? '0.00'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Реквізити */}
                            <div className="mb-4">
                                <label className="form-label text-secondary small fw-bold">RECIPIENT`S PAYMENT DETAILS</label>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="form-control admin-login__input border-secondary text-white bg-dark"
                                        readOnly
                                        value={details?.accountDetails ?? 'No destination account details available'}
                                    />
                                    <button
                                        className="btn btn-outline-secondary"
                                        type="button"
                                        disabled={!details?.accountDetails}
                                        onClick={() => details?.accountDetails && navigator.clipboard.writeText(details.accountDetails)}
                                        title="Copy details"
                                    >
                                        <i className="bi bi-clipboard" />
                                    </button>
                                </div>
                            </div>

                            {submitError && (
                                <div className="alert alert-danger py-2 small mb-3">{submitError}</div>
                            )}

                            {actionType === 'none' && (
                                <div className="d-flex gap-3 mt-4">
                                    <button
                                        type="button"
                                        className="btn btn-danger w-50 fw-bold py-2"
                                        onClick={() => setActionType('reject')}
                                    >
                                        <i className="bi bi-x-circle me-2" />
                                        Reject application
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-success w-50 fw-bold py-2"
                                        onClick={() => setActionType('approve')}
                                    >
                                        <i className="bi bi-check-circle me-2" />
                                        Confirm payment
                                    </button>
                                </div>
                            )}

                            {actionType === 'approve' && (
                                <form onSubmit={handleApproveSubmit} className="mt-3 border-top border-secondary pt-3">
                                    <div className="mb-3">
                                        <label className="form-label text-success small fw-bold">PROVIDER REFERENCE ID *</label>
                                        <input
                                            type="text"
                                            required
                                            className="form-control admin-login__input border-success"
                                            placeholder="Please insert the receipt/transaction number from the payment system"
                                            value={providerReferenceId}
                                            onChange={e => setProviderReferenceId(e.target.value)}
                                        />
                                    </div>
                                    <div className="d-flex gap-2 justify-content-end">
                                        <button type="button" className="btn btn-sm btn-admin-dark" onClick={() => setActionType('none')}>Back</button>
                                        <button type="submit" className="btn btn-sm btn-success px-4" disabled={isApproving}>
                                            {isApproving ? 'Saving...' : 'Complete payment'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {actionType === 'reject' && (
                                <form onSubmit={handleRejectSubmit} className="mt-3 border-top border-secondary pt-3">
                                    <div className="mb-3">
                                        <label className="form-label text-danger small fw-bold">REASON FOR REFUSAL *</label>
                                        <textarea
                                            required
                                            rows={3}
                                            className="form-control admin-login__input border-danger"
                                            placeholder="Incorrect account details, suspected activity..."
                                            value={rejectReason}
                                            onChange={e => setRejectReason(e.target.value)}
                                        />
                                    </div>
                                    <div className="d-flex gap-2 justify-content-end">
                                        <button type="button" className="btn btn-sm btn-admin-dark" onClick={() => setActionType('none')}>Back</button>
                                        <button type="submit" className="btn btn-sm btn-danger px-4" disabled={isRejecting}>
                                            {isRejecting ? 'Rejection...' : 'Reject request'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};