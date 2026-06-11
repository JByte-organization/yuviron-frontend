'use client';

import React from 'react';
import { type PayoutRequestListItemDto } from '@repo/api/admin';

interface PayoutRowProps {
    payout: PayoutRequestListItemDto;
    onViewDetails: (id: string) => void;
}

const formatDate = (dateString?: string): string => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('uk-UA', {
        day:   '2-digit',
        month: '2-digit',
        year:  'numeric',
        hour:  '2-digit',
        minute:'2-digit'
    });
};

const formatCurrency = (amount?: number): string => {
    if (amount === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export const PayoutRow = ({ payout, onViewDetails }: PayoutRowProps) => {
    const getStatusBadgeClass = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'bg-warning text-dark';
            case 'approved':
            case 'paid':
                return 'bg-success';
            case 'rejected':
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    };

    return (
        <tr className="border-bottom border-secondary align-middle" style={{ backgroundColor: '#212631' }}>
            {/* Дата створення заявки */}
            <td className="px-4 text-secondary small text-nowrap">
                {formatDate(payout.requestedAt)}
            </td>

            {/* Артист */}
            <td className="text-white fw-semibold">
                {(payout.artist as { name?: string } | null)?.name ?? 'Unknown Artist'}
            </td>

            {/* Сума до виведення */}
            <td className="text-cyan fw-bold">
                {formatCurrency(payout.requestedAmount)}
            </td>

            {/* Траст-фактор за весь час */}
            <td className="text-info small">
                {formatCurrency(payout.artistTotalEarned)}
            </td>

            {/* Статус */}
            <td className="text-center">
                <span className={`badge ${getStatusBadgeClass(payout.status)} px-3 py-2`}>
                    {payout.status ?? 'Unknown'}
                </span>
            </td>

            {/* Примітка відмови */}
            <td className="text-center">
                {payout.decisionNote ? (
                    <span
                        className="text-secondary"
                        style={{ cursor: 'help' }}
                        title={payout.decisionNote}
                    >
                        <i className="bi bi-info-circle-fill text-muted fs-5" />
                    </span>
                ) : (
                    <span className="text-muted small">—</span>
                )}
            </td>

            {/* Кнопка виклику деталей */}
            <td className="text-end px-4">
                <button
                    className="btn btn-sm btn-primary px-3 border-0 shadow-none text-nowrap fw-semibold"
                    disabled={!payout.id}
                    onClick={() => payout.id && onViewDetails(payout.id)}
                    title="Process request"
                >
                    <i className="bi bi-wallet2 me-1" />
                    Details
                </button>
            </td>
        </tr>
    );
};