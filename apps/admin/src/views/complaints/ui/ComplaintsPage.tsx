'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
    useGetApiAdminComplaints,
    type ComplaintListItemDto,
    type ComplaintListItemDtoPaginatedList,
    type GetApiAdminComplaintsParams,
} from '@repo/api/admin.ts';
import { BaseTable } from '@/shared/ui/Table/BaseTable';
import { Pagination } from '@/shared/ui/Pagination';
import { ComplaintRow } from '@/entities/complaint/ui/ComplaintRow';
import { ReviewComplaintModal } from '@/features/complaint/review/ui/ReviewComplaintModal';

const PAGE_SIZE = 10;

const COLUMNS = ['Target Type', 'Target ID', 'Reason Code', 'Reporter Email', 'Status', 'Created At'];

const SORT_OPTIONS = [
    { value: 'CreatedAt', label: 'Date Created' },
    { value: 'Status',    label: 'Status Level' },
    { value: 'TargetType', label: 'Content Type' },
];

export const ComplaintsPage = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch]           = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [sortBy, setSortBy]       = useState<string | undefined>('Id');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const [reviewingComplaint, setReviewingComplaint] = useState<ComplaintListItemDto | null>(null);
    const [selectedIds, setSelectedIds]               = useState<Set<string>>(new Set());

    const queryParams: GetApiAdminComplaintsParams = useMemo(() => ({
        Page: page,
        PageSize: PAGE_SIZE,
        SearchTerm: search || undefined,
        SortBy: sortBy,
        SortOrder: sortBy ? sortOrder : undefined,
    }), [page, search, sortBy, sortOrder]);

    const { data, isLoading, isError, refetch } = useGetApiAdminComplaints(queryParams);

    const responseData = data as ComplaintListItemDtoPaginatedList | undefined;
    const complaints = responseData?.items ?? [];
    const totalPages = responseData?.totalPages ?? 1;
    const totalCount = responseData?.totalCount ?? 0;

    const handleToggleSelect = useCallback((id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    const handleSearch = useCallback(() => {
        setPage(1);
        setSearch(searchInput);
    }, [searchInput]);

    const handleSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter')  handleSearch();
        if (e.key === 'Escape') { setSearchInput(''); setSearch(''); setPage(1); }
    }, [handleSearch]);

    const handleClearSearch = useCallback(() => {
        setSearchInput('');
        setSearch('');
        setPage(1);
    }, []);

    const handleSortChange = useCallback((newSortBy: string, newSortOrder: 'asc' | 'desc') => {
        if (sortBy === newSortBy && sortOrder === newSortOrder) {
            setSortBy(undefined);
            setSortOrder('asc');
        } else {
            setSortBy(newSortBy);
            setSortOrder(newSortOrder);
        }
        setPage(1);
    }, [sortBy, sortOrder]);

    return (
        <>
            <BaseTable
                title="System Complaints"
                subtitle={`Moderate user claims, reported items, and privacy infractions (${totalCount} tickets)`}
                columns={COLUMNS}
                onNewClick={undefined} // Кнопка "Create" нам тут не нужна
                searchPlaceholder="Search complaints by reporter email..."
                searchValue={searchInput}
                onSearchChange={(e) => setSearchInput(e.target.value)}
                onSearchKeyDown={handleSearchKeyDown}
                onSearchClear={handleClearSearch}
                sortOptions={SORT_OPTIONS}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                isAllSelected={selectedIds.size === complaints.length && complaints.length > 0}
                onSelectAll={() => {
                    if (selectedIds.size === complaints.length) {
                        setSelectedIds(new Set());
                    } else {
                        setSelectedIds(new Set(complaints.map(c => c.id!)));
                    }
                }}
                selectedCount={selectedIds.size}
                pagination={<Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
            >
                {isLoading ? (
                    <tr>
                        <td colSpan={COLUMNS.length + 2} className="text-center py-5">
                            <div className="spinner-border text-primary" role="status" />
                            <div className="text-secondary mt-2 small">Fetching moderation stream...</div>
                        </td>
                    </tr>
                ) : isError ? (
                    <tr>
                        <td colSpan={COLUMNS.length + 2} className="text-center py-5 text-danger small">
                            Error loading moderation logs.
                        </td>
                    </tr>
                ) : complaints.length === 0 ? (
                    <tr>
                        <td colSpan={COLUMNS.length + 2} className="text-center py-5 text-secondary small">
                            {search ? `No tickets matching "${search}"` : 'Clear queue. No active complaints.'}
                        </td>
                    </tr>
                ) : (
                    complaints.map((complaint) => (
                        <ComplaintRow
                            key={complaint.id}
                            complaint={complaint}
                            isSelected={selectedIds.has(complaint.id!)}
                            onSelect={() => handleToggleSelect(complaint.id!)}
                            onReview={setReviewingComplaint}
                        />
                    ))
                )}
            </BaseTable>

            {reviewingComplaint && (
                <ReviewComplaintModal
                    complaint={reviewingComplaint}
                    isOpen={!!reviewingComplaint}
                    onClose={() => setReviewingComplaint(null)}
                    onSuccess={() => { refetch(); setReviewingComplaint(null); }}
                />
            )}
        </>
    );
};