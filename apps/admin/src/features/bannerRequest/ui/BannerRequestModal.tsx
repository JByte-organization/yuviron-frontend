'use client';

import React, { useEffect, useState } from 'react';
import {
    BannerRequestStatus,
    usePostApiAdminBannersRequestsRequestIdApprove,
    usePostApiAdminBannersRequestsRequestIdReject,
    type BannerRequestListItemDto,
    type ApproveBannerRequestCommand,
    type RejectBannerRequestCommand,
} from '@repo/api/admin.ts';
import { getImageUrl } from '@/shared/lib/getImageUrl';

interface Props {
    request: BannerRequestListItemDto | null;
    isOpen: boolean;
    onClose: () => void;
    onResolved: () => void;
}

const toIsoOrNull = (local: string): string | null =>
    local ? new Date(local).toISOString() : null;

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="mb-3">
        <div className="text-secondary small text-uppercase fw-semibold mb-1">{label}</div>
        <div className="text-white">{children}</div>
    </div>
);

export const BannerRequestModal = ({ request, isOpen, onClose, onResolved }: Props) => {
    const [isActive,   setIsActive]   = useState(true);
    const [startsAt,   setStartsAt]   = useState('');
    const [reason,     setReason]     = useState('');
    const [error,      setError]      = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) { setIsActive(true); setStartsAt(''); setReason(''); setError(null); }
    }, [isOpen, request?.id]);

    const { mutateAsync: approve, isPending: isApproving } = usePostApiAdminBannersRequestsRequestIdApprove();
    const { mutateAsync: reject,  isPending: isRejecting }  = usePostApiAdminBannersRequestsRequestIdReject();
    const isMutating = isApproving || isRejecting;

    const handleClose = () => {
        setError(null);
        onClose();
    };

    const handleApprove = async () => {
        if (!request?.id) return;
        setError(null);
        try {
            const data: ApproveBannerRequestCommand = {
                requestId:   request.id,
                isActive,
                startsAtUtc: toIsoOrNull(startsAt),
            };
            await approve({ requestId: request.id, data });
            onResolved();
            handleClose();
        } catch (e) {
            const d = (e as { response?: { data?: { detail?: string; title?: string } } })?.response?.data;
            setError(d?.detail || d?.title || 'Failed to approve the request. Try again.');
        }
    };

    const handleReject = async () => {
        if (!request?.id) return;
        setError(null);
        try {
            const data: RejectBannerRequestCommand = {
                requestId: request.id,
                reason:    reason.trim() || null,
            };
            await reject({ requestId: request.id, data });
            onResolved();
            handleClose();
        } catch (e) {
            const d = (e as { response?: { data?: { detail?: string; title?: string } } })?.response?.data;
            setError(d?.detail || d?.title || 'Failed to reject the request. Try again.');
        }
    };

    if (!isOpen || !request) return null;

    const previewSrc = getImageUrl(request.bannerUrl);
    const isPending = request.status === BannerRequestStatus.Pending;
    const created = request.createdAt ? new Date(request.createdAt).toLocaleString('en-GB') : '—';

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ maxWidth: '560px' }}>
                <div className="modal-content bg-admin-primary border border-secondary shadow-lg text-white">

                    <div className="modal-header border-secondary p-4">
                        <h5 className="modal-title fw-bold">Banner Request</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={handleClose} />
                    </div>

                    <div className="modal-body p-4">
                        <div
                            className="rounded overflow-hidden bg-secondary d-flex align-items-center justify-content-center mb-4"
                            style={{ width: '100%', height: 160 }}
                        >
                            {previewSrc
                                ? <img src={previewSrc} alt="banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <div className="text-center text-white-50">
                                    <i className="bi bi-image" style={{ fontSize: 36 }} />
                                    <p className="mb-0 small mt-2">No image</p>
                                </div>}
                        </div>

                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="overflow-hidden">
                                <div className="fw-bold text-white text-truncate">
                                    {request.artistName || 'Unknown Artist'}
                                </div>
                                <div className="small text-secondary font-monospace text-truncate">
                                    {request.artistId}
                                </div>
                            </div>
                            <span className={`badge ms-2 flex-shrink-0 ${
                                request.status === BannerRequestStatus.Approved ? 'bg-success'
                                : request.status === BannerRequestStatus.Pending ? 'bg-warning text-dark'
                                : request.status === BannerRequestStatus.Rejected ? 'bg-danger'
                                : 'bg-secondary'}`}>
                                {String(request.status ?? '—')}
                            </span>
                        </div>

                        <div className="row">
                            <div className="col-6"><Field label="Album">{request.albumTitle || '—'}</Field></div>
                            <div className="col-6"><Field label="Submitted">{created}</Field></div>
                        </div>

                        <Field label="Title">{request.title || '—'}</Field>

                        {request.adminNotes && (
                            <Field label="Admin notes">
                                <span className="text-white-50">{request.adminNotes}</span>
                            </Field>
                        )}

                        {isPending && (
                            <div className="mt-4 d-flex flex-column gap-3">
                                <div className="form-check form-switch">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="approve-isActive"
                                        checked={isActive}
                                        onChange={(e) => setIsActive(e.target.checked)}
                                    />
                                    <label className="form-check-label text-white fw-semibold" htmlFor="approve-isActive">
                                        Activate immediately on approve
                                    </label>
                                </div>

                                <div>
                                    <label className="text-secondary small text-uppercase fw-semibold mb-1">
                                        Start at (UTC) — optional
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className="form-control bg-dark text-white border-secondary"
                                        value={startsAt}
                                        onChange={(e) => setStartsAt(e.target.value)}
                                    />
                                    <div className="form-text text-secondary small">
                                        Порожньо = показ з моменту активації
                                    </div>
                                </div>

                                <div>
                                    <label className="text-secondary small text-uppercase fw-semibold mb-1">
                                        Reject reason (optional)
                                    </label>
                                    <textarea
                                        className="form-control bg-dark text-white border-secondary"
                                        rows={2}
                                        placeholder="Shown to the artist on reject…"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {error && <div className="text-danger small mt-3">{error}</div>}
                    </div>

                    <div className="modal-footer border-0 p-4 gap-2">
                        <button
                            type="button"
                            className="btn btn-admin-dark px-4"
                            onClick={handleClose}
                            disabled={isMutating}
                        >
                            Close
                        </button>
                        {isPending && (
                            <>
                                <button
                                    type="button"
                                    className="btn btn-danger px-4 fw-bold"
                                    onClick={handleReject}
                                    disabled={isMutating}
                                >
                                    {isRejecting
                                        ? <><span className="spinner-border spinner-border-sm me-2" />Rejecting…</>
                                        : 'Reject'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success px-4 fw-bold"
                                    onClick={handleApprove}
                                    disabled={isMutating}
                                >
                                    {isApproving
                                        ? <><span className="spinner-border spinner-border-sm me-2" />Approving…</>
                                        : 'Approve'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
