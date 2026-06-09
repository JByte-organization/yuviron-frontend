'use client';

import React, { useState } from 'react';
import {
    useGetApiAdminUsers,
    type UserListItemDto,
    type UserListItemDtoPaginatedList,
    type GetApiAdminUsersParams,
    AccountState,
} from '@repo/api/admin.ts';
import { BaseTable } from '@/shared/ui/Table/BaseTable';
import { UserRow } from '@/entities/user/ui/UserRow';
import { CreateUserModal } from '@/features/user/create/ui/CreateUserModal';
import { EditUserModal } from '@/features/user/edit/ui/EditUserModal';
import { DeleteUserModal } from '@/features/user/delete/ui/DeleteUserModal';
import { tableColumns } from '@/entities/user/model/constants';
import { Pagination } from '@/shared/ui/Pagination';

const PAGE_SIZE = 10;

const SORT_OPTIONS = [
    { value: 'firstName', label: 'Name (A-Z)' },
    { value: 'createdAt', label: 'Date Created' },
    { value: 'updatedAt', label: 'Date Updated' },
    { value: 'email',     label: 'Email' },
];

const ACCOUNT_STATE_OPTIONS = [
    { value: AccountState.Active,  label: 'Active'   },
    { value: AccountState.Banned,  label: 'Banned'   },
    { value: AccountState.Deleted, label: 'Deleted'  },
    { value: AccountState.Unknown, label: 'Unknown'  },
];

// Ролі з UserRow — ManagementUser відповідає Manager
const ROLE_OPTIONS = [
    { value: 'User',           label: 'User'    },
    { value: 'ManagementUser', label: 'Manager' },
    { value: 'Admin',          label: 'Admin'   },
];

type DateRange = 'today' | 'week' | 'month' | undefined;

interface FilterState {
    accountStates: string[];
    roles: string[];
    dateRange: DateRange;
}

const EMPTY_FILTERS: FilterState = {
    accountStates: [],
    roles: [],
    dateRange: undefined,
};

export const UsersPage = () => {
    // ─── Модалки ──────────────────────────────────────────
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingUser, setEditingUser]   = useState<UserListItemDto | null>(null);
    const [deletingUser, setDeletingUser] = useState<UserListItemDto | null>(null);
    const [selectedIds, setSelectedIds]   = useState<Set<string>>(new Set());

    // ─── Пагінація ────────────────────────────────────────
    const [page, setPage] = useState(1);

    // ─── Пошук ────────────────────────────────────────────
    const [search, setSearch]           = useState('');
    const [searchInput, setSearchInput] = useState('');

    // ─── Сортування ───────────────────────────────────────
    const [sortBy, setSortBy]       = useState<string | undefined>(undefined);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // ─── Фільтри ──────────────────────────────────────────
    const [draftFilters, setDraftFilters]   = useState<FilterState>(EMPTY_FILTERS);
    const [activeFilters, setActiveFilters] = useState<FilterState>(EMPTY_FILTERS);

    const activeFiltersCount = [
        activeFilters.accountStates.length > 0,
        activeFilters.roles.length > 0,
        activeFilters.dateRange !== undefined,
    ].filter(Boolean).length;

    // ─── Запит ────────────────────────────────────────────
    const queryParams: GetApiAdminUsersParams = {
        Page:      page,
        PageSize:  PAGE_SIZE,
        SearchTerm: search || undefined,
        SortBy:    sortBy,
        SortOrder: sortBy ? sortOrder : undefined,
        AccountState: activeFilters.accountStates.length === 1
            ? activeFilters.accountStates[0] as typeof AccountState[keyof typeof AccountState]
            : undefined,
    };

    const { data, isLoading, isError, refetch } = useGetApiAdminUsers(queryParams);

    const responseData = data as UserListItemDtoPaginatedList | undefined;
    //console.log(responseData);
    const allUsers   = responseData?.items ?? [];
    const totalPages = responseData?.totalPages ?? 1;
    const totalCount = responseData?.totalCount ?? 0;

    // Фільтрація по ролях — на фронтенді
    const users = activeFilters.roles.length > 0
        ? allUsers.filter(user =>
            activeFilters.roles.some(role => user.roles?.includes(role))
        )
        : allUsers;

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
            setSortBy(undefined);
            setSortOrder('asc');
        } else {
            setSortBy(newSortBy);
            setSortOrder(newSortOrder);
        }
        setPage(1);
    };

    const handleApplyFilters = () => { setActiveFilters({ ...draftFilters }); setPage(1); };
    const handleResetFilters = () => {
        setDraftFilters(EMPTY_FILTERS);
        setActiveFilters(EMPTY_FILTERS);
        setPage(1);
    };

    const toggleCheckbox = (field: 'accountStates' | 'roles', value: string) => {
        setDraftFilters(prev => {
            const current = prev[field];
            return {
                ...prev,
                [field]: current.includes(value)
                    ? current.filter(v => v !== value)
                    : [...current, value],
            };
        });
    };

    // ─── Filter content ───────────────────────────────────
    const filterContent = (
        <div className="d-flex flex-column gap-4">

            {/* Account State */}
            <div>
                <p className="text-secondary small fw-semibold text-uppercase mb-2">
                    Account State
                </p>
                <div className="d-flex flex-column gap-2">
                    {ACCOUNT_STATE_OPTIONS.map((opt) => (
                        <label key={opt.value} className="d-flex align-items-center gap-2">
                            <input
                                type="checkbox"
                                className="form-check-input bg-dark border-secondary"
                                checked={draftFilters.accountStates.includes(opt.value)}
                                onChange={() => toggleCheckbox('accountStates', opt.value)}
                            />
                            <span className="text-white">{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Role */}
            <div>
                <p className="text-secondary small fw-semibold text-uppercase mb-2">
                    Role
                </p>
                <div className="d-flex flex-column gap-2">
                    {ROLE_OPTIONS.map((opt) => (
                        <label key={opt.value} className="d-flex align-items-center gap-2">
                            <input
                                type="checkbox"
                                className="form-check-input bg-dark border-secondary"
                                checked={draftFilters.roles.includes(opt.value)}
                                onChange={() => toggleCheckbox('roles', opt.value)}
                            />
                            <span className="text-white">{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Date Created */}
            <div>
                <p className="text-secondary small fw-semibold text-uppercase mb-2">
                    Date Created
                </p>
                <div className="d-flex flex-column gap-2">
                    {([
                        { value: 'today', label: 'Today'       },
                        { value: 'week',  label: 'Last 7 days' },
                        { value: 'month', label: 'Last 30 days'},
                    ] as { value: DateRange; label: string }[]).map((opt) => (
                        <label key={opt.value as string} className="d-flex align-items-center gap-2">
                            <input
                                type="checkbox"
                                className="form-check-input bg-dark border-secondary"
                                checked={draftFilters.dateRange === opt.value}
                                onChange={() => setDraftFilters(prev => ({
                                    ...prev,
                                    dateRange: prev.dateRange === opt.value ? undefined : opt.value,
                                }))}
                            />
                            <span className="text-white">{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>

        </div>
    );

    return (
        <>
            <BaseTable
                title="Users"
                subtitle={`Manage system users and access levels (${totalCount} total)`}
                onNewClick={() => setIsCreateModalOpen(true)}
                searchPlaceholder="Search by name or email..."
                searchValue={searchInput}
                onSearchChange={(e) => setSearchInput(e.target.value)}
                onSearchKeyDown={handleSearchKeyDown}
                onSearchClear={handleClearSearch}
                columns={tableColumns}
                filterContent={filterContent}
                onApplyFilters={handleApplyFilters}
                onResetFilters={handleResetFilters}
                activeFiltersCount={activeFiltersCount}
                sortOptions={SORT_OPTIONS}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                isAllSelected={selectedIds.size === users.length && users.length > 0}
                onSelectAll={() => {
                    if (selectedIds.size === users.length) {
                        setSelectedIds(new Set());
                    } else {
                        setSelectedIds(new Set(users.map(u => u.id!)));
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
                        <td colSpan={9} className="text-center py-5">
                            <div className="spinner-border text-primary" role="status" />
                            <div className="text-secondary mt-2">Fetching users...</div>
                        </td>
                    </tr>
                ) : isError ? (
                    <tr>
                        <td colSpan={9} className="text-center py-5 text-danger">
                            Error loading users. Check your API connection.
                        </td>
                    </tr>
                ) : users.length === 0 ? (
                    <tr>
                        <td colSpan={9} className="text-center py-5 text-secondary">
                            {search ? `No users found for "${search}"` : 'No users found.'}
                        </td>
                    </tr>
                ) : (
                    users.map((user) => (
                        <UserRow
                            key={user.id}
                            user={user}
                            onEdit={setEditingUser}
                            onDelete={setDeletingUser}
                            isSelected={selectedIds.has(user.id!)}
                            onSelect={() => handleToggleSelect(user.id!)}
                        />
                    ))
                )}
            </BaseTable>

            <CreateUserModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => { refetch(); setIsCreateModalOpen(false); }}
            />
            <EditUserModal
                user={editingUser}
                isOpen={!!editingUser}
                onClose={() => setEditingUser(null)}
                onSuccess={() => { refetch(); setEditingUser(null); }}
            />
            <DeleteUserModal
                user={deletingUser}
                isOpen={!!deletingUser}
                onClose={() => setDeletingUser(null)}
                onSuccess={() => { refetch(); setDeletingUser(null); }}
            />
        </>
    );
};