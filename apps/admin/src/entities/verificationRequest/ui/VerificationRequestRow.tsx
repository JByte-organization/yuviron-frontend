'use client';

import React from 'react';
import {
    VerificationRequestStatus,
    type VerificationRequestListItemDto,
} from '@repo/api/admin.ts';

interface Props {
    request: VerificationRequestListItemDto;
    isSelected: boolean;
    onSelect: () => void;
    /** Открыть детали заявки (Approve/Reject внутри модалки). */
    onOpen: (request: VerificationRequestListItemDto) => void;
}

export const statusBadge = (status?: VerificationRequestStatus) => {
    const s = String(status ?? '');
    const cls =
        s === VerificationRequestStatus.Approved ? 'bg-success'
        : s === VerificationRequestStatus.Pending ? 'bg-warning text-dark'
        : s === VerificationRequestStatus.Rejected ? 'bg-danger'
        : 'bg-secondary';
    return <span className={`badge ${cls}`}>{s || '—'}</span>;
};

export const VerificationRequestRow = ({ request, isSelected, onSelect, onOpen }: Props) => {
    const created = request.createdAt
        ? new Date(request.createdAt).toLocaleDateString('en-GB')
        : '—';

    return (
        <tr
            className="border-bottom border-secondary align-middle"
            style={{ backgroundColor: '#212631', cursor: 'pointer' }}
            onClick={() => onOpen(request)}
        >
            <td className="px-4" onClick={(e) => e.stopPropagation()}>
                <input
                    type="checkbox"
                    className="form-check-input bg-dark border-secondary shadow-none"
                    checked={isSelected}
                    onChange={onSelect}
                />
            </td>

            {/* Artist */}
            <td className="py-3">
                <div className="text-white fw-bold text-nowrap">
                    {request.artistName || 'Unknown Artist'}
                </div>
                <div className="text-secondary small font-monospace">
                    {request.artistId ? `${request.artistId.slice(0, 8)}…` : ''}
                </div>
            </td>

            {/* Submitted by */}
            <td className="text-secondary small">{request.submittedByUserEmail || '—'}</td>

            {/* Claimed role */}
            <td className="text-white small">{request.claimedRole ?? '—'}</td>

            {/* Status */}
            <td>{statusBadge(request.status)}</td>

            {/* Created */}
            <td className="text-secondary small">{created}</td>

            {/* Action */}
            <td className="text-end pe-4" onClick={(e) => e.stopPropagation()}>
                <button
                    className="btn btn-sm btn-admin-dark text-nowrap"
                    onClick={() => onOpen(request)}
                >
                    Review
                </button>
            </td>
        </tr>
    );
};
