'use client';

import React, { useState } from 'react';
import {
    BannerRequestStatus,
    useGetApiAdminBannersRequests,
    type GetApiAdminBannersRequestsParams,
    type BannerRequestListItemDto,
    type BannerRequestListItemDtoPaginatedList,
} from '@repo/api/admin.ts';
import { BaseTable } from '@/shared/ui/Table/BaseTable';
import { Pagination } from '@/shared/ui/Pagination';
import { bannerRequestTableColumns } from '@/entities/bannerRequest/model/columns';
import { BannerRequestRow } from '@/entities/bannerRequest/ui/BannerRequestRow';
import { BannerRequestModal } from '@/features/bannerRequest/ui/BannerRequestModal';

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
    { value: 'createdAt',  label: 'Date Created' },
    { value: 'artistName', label: 'Artist (A-Z)' },
];

const STATUS_OPTIONS = [
    { value: BannerRequestStatus.Pending,  label: 'Pending'  },
    { value: BannerRequestStatus.Approved, label: 'Approved' },
    { value: BannerRequestStatus.Rejected, label: 'Rejected' },
];

interface FilterState {
    status: BannerRequestStatus | null;
}

const DEFAULT_FILTERS: FilterState = { status: BannerRequestStatus.Pending };

export const BannerRequestsPage = () => {
    const [opened, setOpened] = useState<BannerRequestListItemDto | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [sortBy, setSortBy] = useState<string | undefined>(undefined);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const [draftFilters, setDraftFilters] = useState<FilterState>(DEFAULT_FILTERS);
    const [activeFilters, setActiveFilters] = useState<FilterState>(DEFAULT_FILTERS);
    const activeFiltersCount = activeFilters.status ? 1 : 0;

    const queryParams: GetApiAdminBannersRequestsParams = {
        Page:       page,
        PageSize:   PAGE_SIZE,
        SearchTerm: search || undefined,
        SortBy:     sortBy,
        SortOrder:  sortBy ? sortOrder : undefined,
        Status:     activeFilters.status ?? undefined,
    };

    const { data, isLoading, isError, refetch } = useGetApiAdminBannersRequests(queryParams);

    const responseData = data as BannerRequestListItemDtoPaginatedList | undefined;
    const requests = responseData?.items ?? [];
    const totalPages = responseData?.totalPages ?? 1;
    const totalCount = responseData?.totalCount ?? 0;

    const handleToggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleSearch = () => { setPage(1); setSearch(searchInput); };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSearch();
        if (e.key === 'Escape') { setSearchInput(''); setSearch(''); setPage(1); }
    };

    const handleClearSearch = () => { setSearchInput(''); setSearch(''); setPage(1); };

    const handleSortChange = (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
        if (sortBy === newSortBy && sortOrder === newSortOrder) {
            setSortBy(undefined);
            setSortOrder('asc');
        } else {
            setSortBy(newSortBy);
            setSortOrder(newSortOrder);
        }
        setPage(1);
    };

    const handleApplyFilters = () => { setActiveFilters({ ...draftFilters }); setPage(1); };
    const handleResetFilters = () => { setDraftFilters(DEFAULT_FILTERS); setActiveFilters(DEFAULT_FILTERS); setPage(1); };

    const filterContent = (
        <div className="d-flex flex-column gap-4">
            <div>
                <p className="text-secondary small fw-semibold text-uppercase mb-2">Status</p>
                <div className="d-flex flex-column gap-2">
                    {STATUS_OPTIONS.map((opt) => (
                        <label key={opt.value} className="d-flex align-items-center gap-2">
                            <input
                                type="radio"
                                name="banner-request-status"
                                className="form-check-input bg-dark border-secondary"
                                checked={draftFilters.status === opt.value}
                                onChange={() => setDraftFilters({ status: opt.value })}
                            />
                            <span className="text-white">{opt.label}</span>
                        </label>
                    ))}
                    <label className="d-flex align-items-center gap-2">
                        <input
                            type="radio"
                            name="banner-request-status"
                            className="form-check-input bg-dark border-secondary"
                            checked={draftFilters.status === null}
                            onChange={() => setDraftFilters({ status: null })}
                        />
                        <span className="text-white">All</span>
                    </label>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <BaseTable
                title="Banner Requests"
                subtitle={`Artist banner submissions queue (Total: ${totalCount})`}
                columns={bannerRequestTableColumns}
                searchPlaceholder="Search by artist or title..."
                searchValue={searchInput}
                onSearchChange={(e) => setSearchInput(e.target.value)}
                onSearchKeyDown={handleSearchKeyDown}
                onSearchClear={handleClearSearch}
                filterContent={filterContent}
                onApplyFilters={handleApplyFilters}
                onResetFilters={handleResetFilters}
                activeFiltersCount={activeFiltersCount}
                sortOptions={SORT_OPTIONS}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                isAllSelected={selectedIds.size === requests.length && requests.length > 0}
                onSelectAll={() => {
                    if (selectedIds.size === requests.length) setSelectedIds(new Set());
                    else setSelectedIds(new Set(requests.map(r => r.id!)));
                }}
                selectedCount={selectedIds.size}
                pagination={
                    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                }
            >
                {isLoading ? (
                    <tr>
                        <td colSpan={bannerRequestTableColumns.length + 2} className="text-center py-5">
                            <div className="spinner-border text-primary" role="status" />
                            <div className="text-secondary mt-2">Fetching requests...</div>
                        </td>
                    </tr>
                ) : isError ? (
                    <tr>
                        <td colSpan={bannerRequestTableColumns.length + 2} className="text-center py-5 text-danger">
                            Error loading banner requests.
                        </td>
                    </tr>
                ) : requests.length === 0 ? (
                    <tr>
                        <td colSpan={bannerRequestTableColumns.length + 2} className="text-center py-5 text-secondary">
                            {search
                                ? `No requests found for "${search}"`
                                : activeFilters.status === BannerRequestStatus.Pending
                                    ? 'Queue is empty — no pending requests. 🎉'
                                    : 'No requests found.'}
                        </td>
                    </tr>
                ) : (
                    requests.map((request: BannerRequestListItemDto) => (
                        <BannerRequestRow
                            key={request.id}
                            request={request}
                            isSelected={selectedIds.has(request.id!)}
                            onSelect={() => handleToggleSelect(request.id!)}
                            onOpen={(r) => setOpened(r)}
                        />
                    ))
                )}
            </BaseTable>

            <BannerRequestModal
                request={opened}
                isOpen={!!opened}
                onClose={() => setOpened(null)}
                onResolved={() => refetch()}
            />
        </>
    );
};
