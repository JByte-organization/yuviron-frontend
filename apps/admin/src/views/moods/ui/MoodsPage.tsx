'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useGetApiAdminMoods, type MoodDto } from '@repo/api/admin.ts';
import { BaseTable } from '@/shared/ui/Table/BaseTable';
import { Pagination } from '@/shared/ui/Pagination';
import { MoodRow } from '@/entities/mood/ui/MoodRow';
import { moodTableColumns } from '@/entities/mood/model/columns';
import { CreateMoodModal } from '@/features/mood/create/ui/CreateMoodModal';
import { EditMoodModal } from '@/features/mood/edit/ui/EditMoodModal';
import { DeleteMoodModal } from '@/features/mood/delete/ui/DeleteMoodModal';

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
    { value: 'Name',        label: 'Mood Name (A-Z)' },
    { value: 'TracksCount', label: 'Tracks Total Count' },
    { value: 'CreatedAt',   label: 'Date Created' },
];

export const MoodsPage = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch]           = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [sortBy, setSortBy]       = useState<string | undefined>(undefined);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Стани модальних вікон та масового виділення
    const [isCreateOpen, setIsCreateOpen]   = useState(false);
    const [editingMood, setEditingMood]     = useState<MoodDto | null>(null);
    const [deletingMood, setDeletingMood]   = useState<MoodDto | null>(null);
    const [selectedIds, setSelectedIds]     = useState<Set<string>>(new Set());

    // Мемоізація уніфікованих параметрів для TanStack Query
    const queryParams = useMemo(() => ({
        Page: page,
        PageSize: PAGE_SIZE,
        SearchTerm: search || undefined,
        SortBy: sortBy,
        SortOrder: sortBy ? sortOrder : undefined,
    }), [page, search, sortBy, sortOrder]);

    const { data, isLoading, isError, refetch } = useGetApiAdminMoods(queryParams as any);

    const responseData = (data as any)?.data || (data as any);
    const moods: MoodDto[]  = responseData?.items ?? [];
    const totalPages        = responseData?.totalPages ?? 1;
    const totalCount        = responseData?.totalCount ?? 0;

    // Керування чекбоксами
    const handleToggleSelect = useCallback((id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    // Пошук
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

    // Сортування
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
                title="Moods"
                subtitle={`Manage music moods, tags, and emotional curation graphs (${totalCount} layers)`}
                columns={moodTableColumns}
                onNewClick={() => setIsCreateOpen(true)}
                searchPlaceholder="Search moods by name..."
                searchValue={searchInput}
                onSearchChange={(e) => setSearchInput(e.target.value)}
                onSearchKeyDown={handleSearchKeyDown}
                onSearchClear={handleClearSearch}
                sortOptions={SORT_OPTIONS}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                isAllSelected={selectedIds.size === moods.length && moods.length > 0}
                onSelectAll={() => {
                    if (selectedIds.size === moods.length) {
                        setSelectedIds(new Set());
                    } else {
                        setSelectedIds(new Set(moods.map(m => m.id!)));
                    }
                }}
                selectedCount={selectedIds.size}
                pagination={<Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
            >
                {isLoading ? (
                    <tr>
                        <td colSpan={moodTableColumns.length + 2} className="text-center py-5">
                            <div className="spinner-border text-primary" role="status" />
                            <div className="text-secondary mt-2 small">Fetching cluster moods...</div>
                        </td>
                    </tr>
                ) : isError ? (
                    <tr>
                        <td colSpan={moodTableColumns.length + 2} className="text-center py-5 text-danger small">
                            Error loading system mood catalog.
                        </td>
                    </tr>
                ) : moods.length === 0 ? (
                    <tr>
                        <td colSpan={moodTableColumns.length + 2} className="text-center py-5 text-secondary small">
                            {search ? `No moods found matching "${search}"` : 'No moods registered in the system.'}
                        </td>
                    </tr>
                ) : (
                    moods.map((mood) => (
                        <MoodRow
                            key={mood.id}
                            mood={mood}
                            isSelected={selectedIds.has(mood.id!)}
                            onSelect={() => handleToggleSelect(mood.id!)}
                            onEdit={setEditingMood}
                            onDelete={setDeletingMood}
                        />
                    ))
                )}
            </BaseTable>

            <CreateMoodModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={refetch}
            />

            {editingMood && (
                <EditMoodModal
                    mood={editingMood}
                    isOpen={!!editingMood}
                    onClose={() => setEditingMood(null)}
                    onSuccess={() => { refetch(); setEditingMood(null); }}
                />
            )}

            {deletingMood && (
                <DeleteMoodModal
                    mood={deletingMood}
                    isOpen={!!deletingMood}
                    onClose={() => setDeletingMood(null)}
                    onSuccess={() => { refetch(); setDeletingMood(null); }}
                />
            )}
        </>
    );
};