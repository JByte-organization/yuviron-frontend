'use client';

import React, { useState } from 'react';
import {
    VerificationRequestStatus,
    getGetApiAdminVerificationRequestsIdQueryKey,
    useGetApiAdminVerificationRequestsId,
    usePostApiAdminVerificationRequestsIdApprove,
    usePostApiAdminVerificationRequestsIdReject,
    type VerificationRequestDetailDto,
} from '@repo/api/admin.ts';
import { getImageUrl } from '@/shared/lib/getImageUrl';

interface Props {
    requestId: string | null;
    isOpen: boolean;
    onClose: () => void;
    onResolved: () => void;
}

const unwrap = <T,>(raw: unknown): T | undefined => {
    if (!raw) return undefined;
    const obj = raw as { data?: T };
    return (obj.data ?? (raw as T)) as T;
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="mb-3">
        <div className="text-secondary small text-uppercase fw-semibold mb-1">{label}</div>
        <div className="text-white">{children}</div>
    </div>
);

export const VerificationRequestModal = ({ requestId, isOpen, onClose, onResolved }: Props) => {
    const [adminNote, setAdminNote] = useState('');
    const [error, setError] = useState<string | null>(null);

    const { data: detailRaw, isLoading } = useGetApiAdminVerificationRequestsId(
        requestId ?? '',
        {
            query: {
                enabled: isOpen && !!requestId,
                queryKey: getGetApiAdminVerificationRequestsIdQueryKey(requestId ?? ''),
            },
        },
    );
    const detail = unwrap<VerificationRequestDetailDto>(detailRaw);

    const { mutateAsync: approve, isPending: isApproving } = usePostApiAdminVerificationRequestsIdApprove();
    const { mutateAsync: reject, isPending: isRejecting } = usePostApiAdminVerificationRequestsIdReject();
    const isMutating = isApproving || isRejecting;

    const handleClose = () => {
        setAdminNote('');
        setError(null);
        onClose();
    };

    const handleDecision = async (decision: 'approve' | 'reject') => {
        if (!requestId) return;
        setError(null);
        try {
            const payload = { id: requestId, data: { adminNote: adminNote.trim() || null } };
            if (decision === 'approve') await approve(payload);
            else await reject(payload);
            onResolved();
            handleClose();
        } catch (e) {
            const data = (e as { response?: { data?: { detail?: string; title?: string } } })?.response?.data;
            setError(data?.detail || data?.title || `Failed to ${decision} the request. Try again.`);
        }
    };

    if (!isOpen || !requestId) return null;

    const avatarSrc = getImageUrl(detail?.artistAvatarUrl);
    const proofSrc = getImageUrl(detail?.proofFileUrl);
    const isPending = detail?.status === VerificationRequestStatus.Pending;

    const links = (detail?.links ?? '')
        .split(/[\s,;]+/)
        .map((l) => l.trim())
        .filter((l) => /^https?:\/\//.test(l));

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ maxWidth: '560px' }}>
                <div className="modal-content bg-admin-primary border border-secondary shadow-lg text-white">

                    <div className="modal-header border-secondary p-4">
                        <h5 className="modal-title fw-bold">Verification Request</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={handleClose} />
                    </div>

                    <div className="modal-body p-4">
                        {isLoading || !detail ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status" />
                                <div className="text-secondary mt-2">Loading request…</div>
                            </div>
                        ) : (
                            <>
                                <div
                                    className="d-flex align-items-center gap-3 p-3 rounded-3 mb-4"
                                    style={{
                                        backgroundColor: 'rgba(13,110,253,0.08)',
                                        border: '1px solid rgba(13,110,253,0.25)',
                                    }}
                                >
                                    <div
                                        className="rounded-circle bg-secondary d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0"
                                        style={{ width: '48px', height: '48px' }}
                                    >
                                        {avatarSrc
                                            ? <img src={avatarSrc} alt="avatar" className="w-100 h-100 object-fit-cover" />
                                            : <span className="fw-bold text-white">
                                                {detail.artistName?.charAt(0)?.toUpperCase() || '?'}
                                            </span>}
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="fw-bold text-white text-truncate">
                                            {detail.artistName || 'Unknown Artist'}
                                        </div>
                                        <div className="small text-secondary font-monospace text-truncate">
                                            {detail.artistId}
                                        </div>
                                    </div>
                                    <span className="badge bg-warning text-dark ms-auto flex-shrink-0">
                                        {detail.status}
                                    </span>
                                </div>

                                <div className="row">
                                    <div className="col-6">
                                        <Field label="Submitted by">{detail.submittedByUserEmail || '—'}</Field>
                                    </div>
                                    <div className="col-6">
                                        <Field label="Claimed role">{detail.claimedRole ?? '—'}</Field>
                                    </div>
                                </div>

                                <Field label="Official email">{detail.officialEmail || '—'}</Field>

                                <Field label="Links">
                                    {links.length > 0 ? (
                                        <div className="d-flex flex-column gap-1">
                                            {links.map((link) => (
                                                <a
                                                    key={link}
                                                    href={link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="link-info text-break small"
                                                >
                                                    {link}
                                                </a>
                                            ))}
                                        </div>
                                    ) : (detail.links || '—')}
                                </Field>

                                <Field label="Message">
                                    <span className="text-white-50">{detail.message || '—'}</span>
                                </Field>

                                <Field label="Proof document">
                                    {proofSrc ? (
                                        <a
                                            href={proofSrc}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="link-info small"
                                        >
                                            Open attachment ↗
                                        </a>
                                    ) : '—'}
                                </Field>

                                {detail.adminNote && (
                                    <Field label="Previous admin note">
                                        <span className="text-white-50">{detail.adminNote}</span>
                                    </Field>
                                )}

                                {isPending && (
                                    <div className="mt-4">
                                        <label className="text-secondary small text-uppercase fw-semibold mb-1">
                                            Admin note (optional, shown on reject)
                                        </label>
                                        <textarea
                                            className="form-control bg-dark text-white border-secondary"
                                            rows={2}
                                            placeholder="Reason / comment…"
                                            value={adminNote}
                                            onChange={(e) => setAdminNote(e.target.value)}
                                        />
                                    </div>
                                )}

                                {error && <div className="text-danger small mt-3">{error}</div>}
                            </>
                        )}
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
                        {detail && isPending && (
                            <>
                                <button
                                    type="button"
                                    className="btn btn-danger px-4 fw-bold"
                                    onClick={() => handleDecision('reject')}
                                    disabled={isMutating}
                                >
                                    {isRejecting
                                        ? <><span className="spinner-border spinner-border-sm me-2" />Rejecting…</>
                                        : 'Reject'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success px-4 fw-bold"
                                    onClick={() => handleDecision('approve')}
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
