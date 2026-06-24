'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
    useGetApiAdminThemes,
    type ThemeListItemDto,
    type ThemeListItemDtoPaginatedList,
    type GetApiAdminThemesParams,
} from '@repo/api/admin.ts';
import { BaseTable } from '@/shared/ui/Table/BaseTable';
import { Pagination } from '@/shared/ui/Pagination';
import { ThemeRow } from '@/entities/theme/ui/ThemeRow';
import { CreateThemeModal } from '@/features/theme/create/ui/CreateThemeModal';
import { EditThemeModal } from '@/features/theme/edit/ui/EditThemeModal';
import { DeleteThemeModal } from '@/features/theme/delete/ui/DeleteThemeModal';

const PAGE_SIZE = 12;
const COLUMNS = ['Theme Name', 'Preview Node', 'Primary Accent', 'Dynamic Fog', 'Deep Ground', 'Premium Only'];

const SORT_OPTIONS = [
    { value: 'Name',      label: 'Theme Name (A-Z)' },
    { value: 'CreatedAt', label: 'Date Created' },
];

export const ThemesPage = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch]           = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [sortBy, setSortBy]       = useState<string | undefined>(undefined);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Кастомний стейт для локальних тостів
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    // Стани модальних вікон
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingTheme, setEditingTheme] = useState<ThemeListItemDto | null>(null);
    const [deletingTheme, setDeletingTheme] = useState<ThemeListItemDto | null>(null);
    const [selectedIds, setSelectedIds]   = useState<Set<string>>(new Set());

    const queryParams: GetApiAdminThemesParams = useMemo(() => ({
        Page: page,
        PageSize: PAGE_SIZE,
        SearchTerm: search || undefined,
        SortBy: sortBy,
        SortOrder: sortBy ? sortOrder : undefined,
    }), [page, search, sortBy, sortOrder]);

    const { data, isLoading, isError, refetch } = useGetApiAdminThemes(queryParams);

    const responseData = (data as any)?.data ?? data as ThemeListItemDtoPaginatedList | undefined;
    const themes     = responseData?.items ?? [];
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
        if (e.key === 'Enter') handleSearch();
        if (e.key === 'Escape') { setSearchInput(''); setSearch(''); setPage(1); }
    }, [handleSearch]);

    const handleClearSearch = useCallback(() => {
        setSearchInput(''); setSearch(''); setPage(1);
    }, []);

    return (
        <div className="position-relative">
            <BaseTable
                title="Ambient UI Themes"
                subtitle={`Deploy and manage official volumetric templates for the streaming platform (${totalCount} active schemes)`}
                columns={COLUMNS}
                onNewClick={() => setIsCreateOpen(true)}
                searchPlaceholder="Search themes by name..."
                searchValue={searchInput}
                onSearchChange={(e) => setSearchInput(e.target.value)}
                onSearchKeyDown={handleSearchKeyDown}
                onSearchClear={handleClearSearch}
                sortOptions={SORT_OPTIONS}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={(b, o) => { setSortBy(b); setSortOrder(o); setPage(1); }}
                isAllSelected={selectedIds.size === themes.length && themes.length > 0}
                onSelectAll={() => setSelectedIds(selectedIds.size === themes.length ? new Set() : new Set(themes.map((t: ThemeListItemDto) => t.id!)))}
                selectedCount={selectedIds.size}
                pagination={<Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
            >
                {isLoading ? (
                    <tr>
                        <td colSpan={COLUMNS.length + 2} className="text-center py-5">
                            <div className="spinner-border text-primary spinner-border-sm" />
                            <div className="text-secondary mt-2 small">Syncing layouts with design matrix...</div>
                        </td>
                    </tr>
                ) : isError ? (
                    <tr>
                        <td colSpan={COLUMNS.length + 2} className="text-center py-5 text-danger small">
                            Error syncing layout templates with core service.
                        </td>
                    </tr>
                ) : themes.length === 0 ? (
                    <tr>
                        <td colSpan={COLUMNS.length + 2} className="text-center py-5 text-secondary small">
                            No approved themes deployed yet.
                        </td>
                    </tr>
                ) : (
                    themes.map((theme: ThemeListItemDto) => (
                        <ThemeRow
                            key={theme.id}
                            theme={theme}
                            isSelected={selectedIds.has(theme.id!)}
                            onSelect={() => handleToggleSelect(theme.id!)}
                            onEdit={setEditingTheme}
                            onDelete={setDeletingTheme}
                        />
                    ))
                )}
            </BaseTable>


            <CreateThemeModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={() => { refetch(); triggerToast('Нову тему успішно розгорнуто в екосистемі клієнта.'); }} />
            {editingTheme && <EditThemeModal theme={editingTheme} isOpen={!!editingTheme} onClose={() => setEditingTheme(null)} onSuccess={() => { refetch(); triggerToast('Конфігурацію вузлів палітри оновлено.'); }} />}
            {deletingTheme && <DeleteThemeModal theme={deletingTheme} isOpen={!!deletingTheme} onClose={() => setDeletingTheme(null)} onSuccess={() => { refetch(); triggerToast('Тему видалено з бази даних клієнта.'); }} />}

            {toastMessage && (
                <div className="yuviron-alert alert-success-toast" style={{ zIndex: 1100 }}>
                    <i className="bi bi-check-circle-fill alert-icon" />
                    <div className="alert-content">{toastMessage}</div>
                </div>
            )}
        </div>
    );
};