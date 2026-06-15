'use client';

import React from 'react';
import {
    BannerRequestStatus,
    type BannerRequestListItemDto,
} from '@repo/api/admin.ts';
import { getImageUrl } from '@/shared/lib/getImageUrl';

interface Props {
    request: BannerRequestListItemDto;
    isSelected: boolean;
    onSelect: () => void;
    /** Відкрити заявку (Approve/Reject усередині модалки). */
    onOpen: (request: BannerRequestListItemDto) => void;
}

// Статуси можуть дрейфувати у swagger — невідомі рендеримо нейтрально (bg-secondary).
export const statusBadge = (status?: BannerRequestStatus) => {
    const s = String(status ?? '');
    const cls =
        s === BannerRequestStatus.Approved ? 'bg-success'
        : s === BannerRequestStatus.Pending ? 'bg-warning text-dark'
        : s === BannerRequestStatus.Rejected ? 'bg-danger'
        : 'bg-secondary';
    return <span className={`badge ${cls}`}>{s || '—'}</span>;
};

export const BannerRequestRow = ({ request, isSelected, onSelect, onOpen }: Props) => {
    const created = request.createdAt
        ? new Date(request.createdAt).toLocaleDateString('en-GB')
        : '—';
    const previewSrc = getImageUrl(request.bannerUrl);

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

            {/* Preview */}
            <td className="py-3">
                <div
                    className="rounded overflow-hidden bg-secondary d-flex align-items-center justify-content-center"
                    style={{ width: 80, height: 40 }}
                >
                    {previewSrc
                        ? <img src={previewSrc} alt="banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <i className="bi bi-image text-white-50" />}
                </div>
            </td>

            {/* Artist */}
            <td>
                <div className="text-white fw-bold text-nowrap">
                    {request.artistName || 'Unknown Artist'}
                </div>
                <div className="text-secondary small font-monospace">
                    {request.artistId ? `${request.artistId.slice(0, 8)}…` : ''}
                </div>
            </td>

            {/* Album */}
            <td className="text-secondary small">{request.albumTitle || '—'}</td>

            {/* Title */}
            <td className="text-white small">{request.title || '—'}</td>

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
