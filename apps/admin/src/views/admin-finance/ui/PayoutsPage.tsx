'use client';

import React, { useState } from 'react';
// 🚨 1. Імпортуємо тип статусу з моделей
import {
    useGetApiAdminFinancePayouts,
    type PayoutRequestListItemDtoPaginatedList,
    type GetApiAdminFinancePayoutsParams,
    type PayoutStatus
} from '@repo/api/admin';
import { BaseTable } from '@/shared/ui/Table/BaseTable';
import { PayoutRow } from '@/entities/payout/ui/PayoutRow';
import { PayoutDetailsModal } from '@/features/payout/ui/PayoutDetailsModal';
import { Pagination } from '@/shared/ui/Pagination';

const PAGE_SIZE = 20;
const TABLE_COLUMNS = ['Created At', 'Artist', 'Requested Amount', 'Total Earned', 'Status', 'Info'];

export const PayoutsPage = () => {
    const [page, setPage] = useState(1);

    const [statusFilter, setStatusFilter] = useState<PayoutStatus | ''>('Pending');
    const [selectedPayoutId, setSelectedPayoutId] = useState<string | null>(null);

    const queryParams: GetApiAdminFinancePayoutsParams = {
        Page: page,
        PageSize: PAGE_SIZE,
        Status: statusFilter || undefined,
    };

    const { data, isLoading, isError, refetch } = useGetApiAdminFinancePayouts(queryParams);

    const responseData = (data as { data?: PayoutRequestListItemDtoPaginatedList } | undefined)?.data
        ?? (data as PayoutRequestListItemDtoPaginatedList | undefined);

    const payoutsList = responseData?.items ?? [];
    const totalPages = responseData?.totalPages ?? 1;
    const totalCount = responseData?.totalCount ?? 0;

    const filterContent = (
        <div className="d-flex flex-column gap-3">
            <div>
                <p className="text-secondary small fw-semibold text-uppercase mb-2">Payout Status</p>
                <div className="d-flex flex-column gap-2">

                    {(['All', 'Pending', 'Approved', 'Paid', 'Rejected'] as const).map((status) => (
                        <label key={status} className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="payoutStatus"
                                className="form-check-input bg-dark border-secondary"
                                checked={status === 'All' ? statusFilter === '' : statusFilter === status}
                                onChange={() => {
                                    // Якщо обрано 'All' — записуємо порожній рядок, інакше — конкретний літерал статусу
                                    setStatusFilter(status === 'All' ? '' : status);
                                    setPage(1);
                                }}
                            />
                            <span className="text-white">{status === 'All' ? 'All Requests' : status}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <>
            <BaseTable
                title="Payout Requests"
                subtitle={`Review and audit artist financial payouts (Total queue: ${totalCount})`}
                columns={TABLE_COLUMNS}
                onNewClick={undefined}
                filterContent={filterContent}
                activeFiltersCount={statusFilter ? 1 : 0}
                pagination={
                    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                }
            >
                {isLoading ? (
                    <tr>
                        <td colSpan={TABLE_COLUMNS.length + 1} className="text-center py-5">
                            <div className="spinner-border text-primary" role="status" />
                            <div className="text-secondary mt-2">Fetching payout records...</div>
                        </td>
                    </tr>
                ) : isError ? (
                    <tr>
                        <td colSpan={TABLE_COLUMNS.length + 1} className="text-center py-5 text-danger fw-semibold">
                            Error loading finance dashboard. Please verify configurations.
                        </td>
                    </tr>
                ) : payoutsList.length === 0 ? (
                    <tr>
                        <td colSpan={TABLE_COLUMNS.length + 1} className="text-center py-5 text-secondary">
                            No payout requests found with status &ldquo;{statusFilter || 'All'}&rdquo;.
                        </td>
                    </tr>
                ) : (
                    payoutsList.map((payout) => (
                        <PayoutRow
                            key={payout.id}
                            payout={payout}
                            onViewDetails={(id) => setSelectedPayoutId(id)}
                        />
                    ))
                )}
            </BaseTable>

            <PayoutDetailsModal
                payoutId={selectedPayoutId}
                isOpen={!!selectedPayoutId}
                onClose={() => setSelectedPayoutId(null)}
                onSuccess={() => refetch()}
            />
        </>
    );
};