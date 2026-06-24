'use client';

import React from 'react';
import Image from 'next/image';
import { type ComplaintListItemDto } from '@repo/api/admin.ts';

interface ComplaintRowProps {
    complaint: ComplaintListItemDto;
    isSelected: boolean;
    onSelect: () => void;
    onReview: (complaint: ComplaintListItemDto) => void;
}

export const ComplaintRow = ({ complaint, isSelected, onSelect, onReview }: ComplaintRowProps) => {
    // Вспомогательный хелпер для красивых Bootstrap-статусов
    const getStatusClass = (status?: string) => {
        switch (status) {
            case 'New': return 'bg-danger text-white';
            case 'InReview': return 'bg-warning text-dark';
            case 'Approved': return 'bg-success text-white';
            case 'Rejected': return 'bg-secondary text-white-50';
            default: return 'bg-dark text-white-50';
        }
    };

    return (
        <tr className="align-middle">
            <td className="px-4">
                <input
                    type="checkbox"
                    className="form-check-input bg-dark border-secondary shadow-none"
                    checked={isSelected}
                    onChange={onSelect}
                />
            </td>
            <td>
                <span className="badge bg-dark border border-secondary text-cyan font-monospace">
                    {complaint.targetType || 'Unknown'}
                </span>
            </td>
            <td>
                <span className="text-white-50 font-monospace small d-inline-block text-truncate" style={{ maxWidth: '120px' }} title={complaint.targetId}>
                    {complaint.targetId || '—'}
                </span>
            </td>
            <td>
                <span className="text-white fw-bold">{complaint.reasonCode || 'General'}</span>
            </td>
            <td>
                <span className="text-white-50 small">{complaint.createdByUserEmail || 'anonymous'}</span>
            </td>
            <td>
                <span className={`badge border border-secondary ${getStatusClass(complaint.status)}`}>
                    {complaint.status}
                </span>
            </td>
            <td className="text-secondary small font-monospace">
                {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString('uk-UA') : '—'}
            </td>
            <td className="px-4 text-end">
                <div className="d-flex justify-content-end">
                    <button
                        className="btn btn-sm btn-secondary border-0 shadow-none d-flex align-items-center gap-2 fw-semibold"
                        onClick={() => onReview(complaint)}
                        title="Review complaint details"
                    >
                        <Image src="/images/icons/edit-btn.svg" width={16} height={16} alt="review" />
                        <span className="small">Review</span>
                    </button>
                </div>
            </td>
        </tr>
    );
};