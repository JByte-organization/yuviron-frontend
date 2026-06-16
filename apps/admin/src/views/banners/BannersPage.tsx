'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
    useGetApiAdminBanners,
    type BannerListItemDto,
    type BannerListItemDtoPaginatedList,
    type GetApiAdminBannersParams,
} from '@repo/api/admin.ts';
import { BaseTable } from '@/shared/ui/Table/BaseTable';
import { BannerRow } from '@/entities/banner/ui/BannerRow';
import { CreateBannerModal } from '@/features/banner/create/ui/CreateBannerModal';
import { EditBannerModal } from '@/features/banner/edit/ui/EditBannerModal';
import { DeleteBannerModal } from '@/features/banner/delete/ui/DeleteBannerModal';
import { Pagination } from '@/shared/ui/Pagination';

const PAGE_SIZE = 20;

const TABLE_COLUMNS = ['Preview', 'Title', 'Status', 'Starts At', 'Ends At'];

const SORT_OPTIONS = [
    { value: 'Title',        label: 'Title (A-Z)' },
    { value: 'StartsAtUtc',  label: 'Start Date' },
    { value: 'EndsAtUtc',    label: 'End Date' },
];

export const BannersPage = () => {
    const [isCreateOpen,   setIsCreateOpen]   = useState(false);
    const [editingBanner,  setEditingBanner]  = useState<BannerListItemDto | null>(null);
    const [deletingBanner, setDeletingBanner] = useState<BannerListItemDto | null>(null);
    const [selectedIds,    setSelectedIds]    = useState<Set<string>>(new Set());

    const [page, setPage] = useState(1);
    const [search, setSearch]           = useState('');
    const [searchInput, setSearchInput] = useState('');

    const [sortBy,    setSortBy]    = useState<string>('StartsAtUtc');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const queryParams: GetApiAdminBannersParams = useMemo(() => ({
        Page:       page,
        PageSize:   PAGE_SIZE,
        SearchTerm: search.trim() || undefined,
        SortBy:     sortBy,
        SortOrder:  sortOrder,
    }), [page, search, sortBy, sortOrder]);

    const { data, isLoading, isError, refetch } = useGetApiAdminBanners(queryParams);

    const responseData = data as BannerListItemDtoPaginatedList | undefined;
    const banners    = responseData?.items ?? [];
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
        setSortBy(newSortBy);
        setSortOrder(newSortOrder);
        setPage(1);
    }, []);

    return (
        <>
            <BaseTable
                title="Banners"
                subtitle={`Manage promo banners (Total: ${totalCount})`}
                columns={TABLE_COLUMNS}
                onNewClick={() => setIsCreateOpen(true)}
                searchPlaceholder="Search by title..."
                searchValue={searchInput}
                onSearchChange={(e) => setSearchInput(e.target.value)}
                onSearchKeyDown={handleSearchKeyDown}
                onSearchClear={handleClearSearch}
                sortOptions={SORT_OPTIONS}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                isAllSelected={selectedIds.size === banners.length && banners.length > 0}
                onSelectAll={() => {
                    if (selectedIds.size === banners.length) {
                        setSelectedIds(new Set());
                    } else {
                        setSelectedIds(new Set(banners.map(b => b.id!)));
                    }
                }}
                selectedCount={selectedIds.size}
                pagination={<Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
            >
                {isLoading ? (
                    <tr>
                        <td colSpan={TABLE_COLUMNS.length + 2} className="text-center py-5">
                            <div className="spinner-border text-primary" role="status" />
                            <div className="text-secondary mt-2">Fetching banners...</div>
                        </td>
                    </tr>
                ) : isError ? (
                    <tr>
                        <td colSpan={TABLE_COLUMNS.length + 2} className="text-center py-5 text-danger">
                            Error loading system campaign banners.
                        </td>
                    </tr>
                ) : banners.length === 0 ? (
                    <tr>
                        <td colSpan={TABLE_COLUMNS.length + 2} className="text-center py-5 text-secondary">
                            {search ? `No banners found for "${search}"` : 'No campaigns deployed yet.'}
                        </td>
                    </tr>
                ) : (
                    banners.map((banner) => (
                        <BannerRow
                            key={banner.id}
                            banner={banner}
                            isSelected={selectedIds.has(banner.id!)}
                            onSelect={() => handleToggleSelect(banner.id!)}
                            onEdit={setEditingBanner}
                            onDelete={setDeletingBanner}
                        />
                    ))
                )}
            </BaseTable>

            <CreateBannerModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={() => { refetch(); setIsCreateOpen(false); }} />
            <EditBannerModal banner={editingBanner} isOpen={!!editingBanner} onClose={() => setEditingBanner(null)} onSuccess={() => { refetch(); setEditingBanner(null); }} />
            <DeleteBannerModal banner={deletingBanner} isOpen={!!deletingBanner} onClose={() => setDeletingBanner(null)} onSuccess={() => { refetch(); setDeletingBanner(null); }} />
        </>
    );
};
