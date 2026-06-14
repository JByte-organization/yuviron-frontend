'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
    useGetApiAdminUsers,
    type UserListItemDto,
    type UserListItemDtoPaginatedList,
    type GetApiAdminUsersParams,
    AccountState,
    AppPermission,
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

const ROLE_OPTIONS = [
    { value: AppPermission.AccessBasic,      label: 'User'    },
    { value: AppPermission.ManageCatalog,    label: 'Manager' },
    { value: AppPermission.AccessAdminPanel, label: 'Admin'   },
];

const DATE_RANGE_OPTIONS = [
    { value: 'today', label: 'Today'       },
    { value: 'week',  label: 'Last 7 days' },
    { value: 'month', label: 'Last 30 days'},
];

type DateRange = 'today' | 'week' | 'month' | undefined;

interface FilterState {
    accountStates: string[];
    rolePermission: string | undefined;
    dateRange: DateRange;
}

const EMPTY_FILTERS: FilterState = {
    accountStates: [],
    rolePermission: undefined,
    dateRange: undefined,
};

export const UsersPage = () => {
    // ─── Модальні вікна ──────────────────────────────────────
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingUser, setEditingUser]   = useState<UserListItemDto | null>(null);
    const [deletingUser, setDeletingUser] = useState<UserListItemDto | null>(null);
    const [selectedIds, setSelectedIds]   = useState<Set<string>>(new Set());

    // ─── Состояние пагінації, пошуку та фільтрів ──────────────
    const [page, setPage] = useState(1);
    const [search, setSearch]           = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [sortBy, setSortBy]       = useState<string | undefined>(undefined);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [draftFilters, setDraftFilters]   = useState<FilterState>(EMPTY_FILTERS);
    const [activeFilters, setActiveFilters] = useState<FilterState>(EMPTY_FILTERS);

    const activeFiltersCount = useMemo(() => [
        activeFilters.accountStates.length > 0,
        activeFilters.rolePermission !== undefined,
        activeFilters.dateRange !== undefined,
    ].filter(Boolean).length, [activeFilters]);

    // ─── ФОРМУВАННЯ ПАРАМЕТРІВ ЗАПРОСУ ДЛЯ СЕРВЕРА ──────────────────
    const queryParams: GetApiAdminUsersParams = useMemo(() => ({
        Page: page,
        PageSize: PAGE_SIZE,
        SearchTerm: search || undefined,
        SortBy: sortBy,
        SortOrder: sortBy ? sortOrder : undefined,
        AccountState: activeFilters.accountStates.length === 1
            ? (activeFilters.accountStates[0] as typeof AccountState[keyof typeof AccountState])
            : undefined,
        RequiredPermission: activeFilters.rolePermission as typeof AppPermission[keyof typeof AppPermission] | undefined,
    }), [page, search, sortBy, sortOrder, activeFilters.accountStates, activeFilters.rolePermission]);

    const { data, isLoading, isError, refetch } = useGetApiAdminUsers(queryParams);

    const responseData = data as UserListItemDtoPaginatedList | undefined;
    const allUsers = responseData?.items ?? [];
    const totalPages = responseData?.totalPages ?? 1;
    const totalCount = responseData?.totalCount ?? 0;

    // ─── СМЕШАННАЯ КЛИЕНТСКАЯ КОРРЕКЦИЯ ───────────────────────────────
    const users = useMemo(() => {
        let filtered = [...allUsers];

        // 1. Мульти-статус (якщо вибрано кілька чекбоксів)
        if (activeFilters.accountStates.length > 1) {
            filtered = filtered.filter(user =>
                user.accountState && activeFilters.accountStates.includes(user.accountState)
            );
        }

        // 2. Фіксація дат створення на клієнті
        if (activeFilters.dateRange) {
            const now = new Date();
            const targetDate = new Date();
            targetDate.setHours(0, 0, 0, 0);

            if (activeFilters.dateRange === 'week') {
                targetDate.setDate(now.getDate() - 7);
            } else if (activeFilters.dateRange === 'month') {
                targetDate.setMonth(now.getMonth() - 1);
            }

            filtered = filtered.filter(user => {
                if (!user.createdAt) return false;
                const userCreated = new Date(user.createdAt);

                if (activeFilters.dateRange === 'today') {
                    return userCreated.toDateString() === now.toDateString();
                }
                return userCreated >= targetDate && userCreated <= now;
            });
        }

        // 🚨 1) ФІКС ФІЛЬТРАЦІЇ ПО РОЛЯХ: Локальний дублюючий фільтр
        // Якщо сервер повернув сирі дані, ми самі перевіряємо наявність пермішена/ролі у DTO
        if (activeFilters.rolePermission) {
            filtered = filtered.filter(user => {
                const userPermissions = (user as any).permissions || (user as any).rolePermissions || [];
                const userRole = (user as any).role || (user as any).permission;

                if (Array.isArray(userPermissions)) {
                    return userPermissions.includes(activeFilters.rolePermission);
                }
                return userRole === activeFilters.rolePermission;
            });
        }

        return filtered;
    }, [allUsers, activeFilters]);

    // 🚨 2) ФІКС ПАГІНАЦІЇ: Динамічний перерахунок сторінок для локальних фільтрів
    // Перевіряємо, чи увімкнено хоча б один клієнтський фільтр (дати або мульти-статуси/ролі)
    const isClientFiltered = activeFilters.dateRange !== undefined || activeFilters.accountStates.length > 1 || activeFilters.rolePermission !== undefined;
    const displayedTotalPages = isClientFiltered ? Math.ceil(users.length / PAGE_SIZE) || 1 : totalPages;

    // ─── Хендлери управління ─────────────────────────────────
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

    const handleApplyFilters = useCallback(() => {
        setActiveFilters({ ...draftFilters });
        setPage(1);
    }, [draftFilters]);

    const handleResetFilters = useCallback(() => {
        setDraftFilters(EMPTY_FILTERS);
        setActiveFilters(EMPTY_FILTERS);
        setPage(1);
    }, []);

    const toggleStatusCheckbox = useCallback((value: string) => {
        setDraftFilters(prev => {
            const current = prev.accountStates;
            return {
                ...prev,
                accountStates: current.includes(value) ? current.filter(v => v !== value) : [...current, value],
            };
        });
    }, []);

    const toggleRoleCheckbox = useCallback((value: string) => {
        setDraftFilters(prev => ({
            ...prev,
            rolePermission: prev.rolePermission === value ? undefined : value
        }));
    }, []);

    const filterContent = (
        <div className="d-flex flex-column gap-4">
            {/* Account State */}
            <div>
                <p className="text-secondary small fw-semibold text-uppercase mb-2">Account State</p>
                <div className="d-flex flex-column gap-2">
                    {ACCOUNT_STATE_OPTIONS.map((opt) => (
                        <label key={opt.value} className="d-flex align-items-center gap-2 m-0 cursor-pointer">
                            <input
                                type="checkbox"
                                className="form-check-input bg-dark border-secondary m-0"
                                checked={draftFilters.accountStates.includes(opt.value)}
                                onChange={() => toggleStatusCheckbox(opt.value)}
                            />
                            <span className="text-white small">{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Role */}
            <div>
                <p className="text-secondary small fw-semibold text-uppercase mb-2">Role</p>
                <div className="d-flex flex-column gap-2">
                    {ROLE_OPTIONS.map((opt) => (
                        <label key={opt.value} className="d-flex align-items-center gap-2 m-0 cursor-pointer">
                            <input
                                type="checkbox"
                                className="form-check-input bg-dark border-secondary m-0"
                                checked={draftFilters.rolePermission === opt.value}
                                onChange={() => toggleRoleCheckbox(opt.value)}
                            />
                            <span className="text-white small">{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Date Created */}
            <div>
                <p className="text-secondary small fw-semibold text-uppercase mb-2">Date Created</p>
                <div className="d-flex flex-column gap-2">
                    {DATE_RANGE_OPTIONS.map((opt) => (
                        <label key={opt.value} className="d-flex align-items-center gap-2 m-0 cursor-pointer">
                            <input
                                type="checkbox"
                                className="form-check-input bg-dark border-secondary m-0"
                                checked={draftFilters.dateRange === opt.value}
                                onChange={() => setDraftFilters(prev => ({
                                    ...prev,
                                    dateRange: prev.dateRange === opt.value ? undefined : (opt.value as DateRange),
                                }))}
                            />
                            <span className="text-white small">{opt.label}</span>
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
                    setSelectedIds(selectedIds.size === users.length ? new Set() : new Set(users.map(u => u.id!)));
                }}
                selectedCount={selectedIds.size}
                pagination={<Pagination page={page} totalPages={displayedTotalPages} onPageChange={setPage} />}
            >
                {isLoading ? (
                    <tr>
                        <td colSpan={9} className="text-center py-5">
                            <div className="spinner-border text-primary" role="status" />
                            <div className="text-secondary mt-2 small">Fetching users...</div>
                        </td>
                    </tr>
                ) : isError ? (
                    <tr>
                        <td colSpan={9} className="text-center py-5 text-danger small">
                            Error loading users. Check your API connection.
                        </td>
                    </tr>
                ) : users.length === 0 ? (
                    <tr>
                        <td colSpan={9} className="text-center py-5 text-secondary small">
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

            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    isOpen={!!editingUser}
                    onClose={() => setEditingUser(null)}
                    onSuccess={() => { refetch(); setEditingUser(null); }}
                />
            )}

            {deletingUser && (
                <DeleteUserModal
                    user={deletingUser}
                    isOpen={!!deletingUser}
                    onClose={() => setDeletingUser(null)}
                    onSuccess={() => { refetch(); setDeletingUser(null); }}
                />
            )}
        </>
    );
};