'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
    useGetApiAdminPlans,
    type PlanListItemDto,
    type PlanListItemDtoPaginatedList,
    type GetApiAdminPlansParams,
} from '@repo/api/admin.ts';
import { BaseTable } from '@/shared/ui/Table/BaseTable';
import { Pagination } from '@/shared/ui/Pagination';
import { PlanRow } from '@/entities/plan/ui/PlanRow';
import { CreatePlanModal } from '@/features/plan/create/ui/CreatePlanModal';
import { EditPlanModal } from '@/features/plan/edit/ui/EditPlanModal';
import { DeletePlanModal } from '@/features/plan/delete/ui/DeletePlanModal';

const PAGE_SIZE = 10;

const COLUMNS = ['Plan Name', 'Price', 'Billing Cycle', 'Subscribers', 'Created At'];

const SORT_OPTIONS = [
    { value: 'Name',      label: 'Plan Name (A-Z)' },
    { value: 'Price',     label: 'Price Amount' },
    { value: 'CreatedAt', label: 'Date Created' },
];

export const PlansPage = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch]           = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [sortBy, setSortBy]       = useState<string | undefined>(undefined);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Состояния модальных окон
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingPlan, setEditingPlan]   = useState<PlanListItemDto | null>(null);
    const [deletingPlan, setDeletingPlan] = useState<PlanListItemDto | null>(null);
    const [selectedIds, setSelectedIds]   = useState<Set<string>>(new Set());

    // Мемоизация параметров запроса к API
    const queryParams: GetApiAdminPlansParams = useMemo(() => ({
        Page: page,
        PageSize: PAGE_SIZE,
        SearchTerm: search || undefined,
        SortBy: sortBy,
        SortOrder: sortBy ? sortOrder : undefined,
    }), [page, search, sortBy, sortOrder]);

    const { data, isLoading, isError, refetch } = useGetApiAdminPlans(queryParams);

    const responseData = data as PlanListItemDtoPaginatedList | undefined;
    const plans      = responseData?.items ?? [];
    const totalPages = responseData?.totalPages ?? 1;
    const totalCount = responseData?.totalCount ?? 0;

    // Оптимизированные хендлеры управления
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
                title="Premium Plans"
                subtitle={`Configure subscription tiers and billing models (${totalCount} layers)`}
                columns={COLUMNS}
                onNewClick={() => setIsCreateOpen(true)}
                searchPlaceholder="Search plans by name..."
                searchValue={searchInput}
                onSearchChange={(e) => setSearchInput(e.target.value)}
                onSearchKeyDown={handleSearchKeyDown}
                onSearchClear={handleClearSearch}
                sortOptions={SORT_OPTIONS}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                isAllSelected={selectedIds.size === plans.length && plans.length > 0}
                onSelectAll={() => {
                    if (selectedIds.size === plans.length) {
                        setSelectedIds(new Set());
                    } else {
                        setSelectedIds(new Set(plans.map(p => p.id!)));
                    }
                }}
                selectedCount={selectedIds.size}
                pagination={<Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
            >
                {isLoading ? (
                    <tr>
                        <td colSpan={COLUMNS.length + 2} className="text-center py-5">
                            <div className="spinner-border text-primary" role="status" />
                            <div className="text-secondary mt-2 small">Fetching tariff grids...</div>
                        </td>
                    </tr>
                ) : isError ? (
                    <tr>
                        <td colSpan={COLUMNS.length + 2} className="text-center py-5 text-danger small">
                            Error loading system premium levels.
                        </td>
                    </tr>
                ) : plans.length === 0 ? (
                    <tr>
                        <td colSpan={COLUMNS.length + 2} className="text-center py-5 text-secondary small">
                            {search ? `No plans found matching "${search}"` : 'No plans registered.'}
                        </td>
                    </tr>
                ) : (
                    plans.map((plan) => (
                        <PlanRow
                            key={plan.id}
                            plan={plan}
                            isSelected={selectedIds.has(plan.id!)}
                            onSelect={() => handleToggleSelect(plan.id!)}
                            onEdit={setEditingPlan}
                            onDelete={setDeletingPlan}
                        />
                    ))
                )}
            </BaseTable>

            <CreatePlanModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={() => { refetch(); setIsCreateOpen(false); }}
            />

            {editingPlan && (
                <EditPlanModal
                    plan={editingPlan}
                    isOpen={!!editingPlan}
                    onClose={() => setEditingPlan(null)}
                    onSuccess={() => { refetch(); setEditingPlan(null); }}
                />
            )}

            {deletingPlan && (
                <DeletePlanModal
                    plan={deletingPlan}
                    isOpen={!!deletingPlan}
                    onClose={() => setDeletingPlan(null)}
                    onSuccess={() => { refetch(); setDeletingPlan(null); }}
                />
            )}
        </>
    );
};