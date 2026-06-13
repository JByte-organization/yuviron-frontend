'use client';

import React, { useState } from 'react';
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

const TABLE_COLUMNS = ['Preview', 'Title', 'Period', 'Status'];

// Банери перейшли з ручного sortOrder на вікно показу (startsAtUtc/endsAtUtc).
const SORT_OPTIONS = [
    { value: 'startsAtUtc', label: 'Start date'  },
    { value: 'endsAtUtc',   label: 'End date'    },
    { value: 'title',       label: 'Title (A-Z)' },
    { value: 'isActive',    label: 'Active first' },
];

const DEFAULT_SORT = 'startsAtUtc';

interface FilterState {
    isActive: boolean | undefined; // true | false | undefined (all)
}

const EMPTY_FILTERS: FilterState = {
    isActive: undefined,
};

export const BannersPage = () => {
    // ─── Модалки ──────────────────────────────────────────
    const [isCreateOpen,   setIsCreateOpen]   = useState(false);
    const [editingBanner,  setEditingBanner]  = useState<BannerListItemDto | null>(null);
    const [deletingBanner, setDeletingBanner] = useState<BannerListItemDto | null>(null);
    const [selectedIds,    setSelectedIds]    = useState<Set<string>>(new Set());

    // ─── Пагінація ────────────────────────────────────────
    const [page, setPage] = useState(1);

    // ─── Пошук ────────────────────────────────────────────
    const [search,      setSearch]      = useState('');
    const [searchInput, setSearchInput] = useState('');

    // ─── Сортування ───────────────────────────────────────
    const [sortBy,    setSortBy]    = useState<string>(DEFAULT_SORT);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // ─── Фільтри ──────────────────────────────────────────
    const [draftFilters,  setDraftFilters]  = useState<FilterState>(EMPTY_FILTERS);
    const [activeFilters, setActiveFilters] = useState<FilterState>(EMPTY_FILTERS);

    const activeFiltersCount = [
        activeFilters.isActive !== undefined,
    ].filter(Boolean).length;

    // ─── Запит ────────────────────────────────────────────
    const queryParams: GetApiAdminBannersParams = {
        Page:      page,
        PageSize:  PAGE_SIZE,
        SearchTerm: search || undefined,
        SortBy:    sortBy,
        SortOrder: sortOrder,
    };

    const { data, isLoading, isError, refetch } = useGetApiAdminBanners(queryParams);

    const responseData = data as BannerListItemDtoPaginatedList | undefined;
    const allBanners = responseData?.items ?? [];
    const totalPages = responseData?.totalPages ?? 1;
    const totalCount = responseData?.totalCount ?? 0;

    // Фільтр isActive на фронтенді (бекенд у списку приймає лише пошук/сортування).
    const banners = allBanners.filter(b => {
        if (activeFilters.isActive !== undefined && b.isActive !== activeFilters.isActive) {
            return false;
        }
        return true;
    });

    // ─── Handlers ─────────────────────────────────────────
    const handleToggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleSearch = () => { setPage(1); setSearch(searchInput); };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter')  handleSearch();
        if (e.key === 'Escape') { setSearchInput(''); setSearch(''); setPage(1); }
    };

    const handleClearSearch = () => { setSearchInput(''); setSearch(''); setPage(1); };

    const handleSortChange = (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
        if (sortBy === newSortBy && sortOrder === newSortOrder) {
            setSortBy(DEFAULT_SORT);
            setSortOrder('desc');
        } else {
            setSortBy(newSortBy);
            setSortOrder(newSortOrder);
        }
        setPage(1);
    };

    const handleApplyFilters  = () => { setActiveFilters({ ...draftFilters }); setPage(1); };
    const handleResetFilters  = () => {
        setDraftFilters(EMPTY_FILTERS);
        setActiveFilters(EMPTY_FILTERS);
        setPage(1);
    };

    // ─── Filter content ───────────────────────────────────
    const filterContent = (
        <div className="d-flex flex-column gap-4">

            {/* Active / Inactive */}
            <div>
                <p className="text-secondary small fw-semibold text-uppercase mb-2">Status</p>
                <div className="d-flex flex-column gap-2">
                    <label className="d-flex align-items-center gap-2">
                        <input
                            type="radio"
                            name="bannerActive"
                            className="form-check-input bg-dark border-secondary"
                            checked={draftFilters.isActive === undefined}
                            onChange={() => setDraftFilters(prev => ({ ...prev, isActive: undefined }))}
                        />
                        <span className="text-white">All</span>
                    </label>
                    <label className="d-flex align-items-center gap-2">
                        <input
                            type="radio"
                            name="bannerActive"
                            className="form-check-input bg-dark border-secondary"
                            checked={draftFilters.isActive === true}
                            onChange={() => setDraftFilters(prev => ({ ...prev, isActive: true }))}
                        />
                        <span className="text-white">Active only</span>
                    </label>
                    <label className="d-flex align-items-center gap-2">
                        <input
                            type="radio"
                            name="bannerActive"
                            className="form-check-input bg-dark border-secondary"
                            checked={draftFilters.isActive === false}
                            onChange={() => setDraftFilters(prev => ({ ...prev, isActive: false }))}
                        />
                        <span className="text-white">Inactive only</span>
                    </label>
                </div>
            </div>

        </div>
    );

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
                filterContent={filterContent}
                onApplyFilters={handleApplyFilters}
                onResetFilters={handleResetFilters}
                activeFiltersCount={activeFiltersCount}
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
                pagination={
                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                }
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
                            Error loading banners.
                        </td>
                    </tr>
                ) : banners.length === 0 ? (
                    <tr>
                        <td colSpan={TABLE_COLUMNS.length + 2} className="text-center py-5 text-secondary">
                            {search
                                ? `No banners found for "${search}"`
                                : 'No banners yet. Create your first banner!'
                            }
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

            <CreateBannerModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={() => { refetch(); setIsCreateOpen(false); }}
            />

            <EditBannerModal
                banner={editingBanner}
                isOpen={!!editingBanner}
                onClose={() => setEditingBanner(null)}
                onSuccess={() => { refetch(); setEditingBanner(null); }}
            />

            <DeleteBannerModal
                banner={deletingBanner}
                isOpen={!!deletingBanner}
                onClose={() => setDeletingBanner(null)}
                onSuccess={() => { refetch(); setDeletingBanner(null); }}
            />
        </>
    );
};
