'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useGetApiAdminGenres, type GenreListItemDto, type GetApiAdminGenresParams } from '@repo/api/admin.ts';
import { BaseTable } from '@/shared/ui/Table/BaseTable';
import { Pagination } from '@/shared/ui/Pagination';
import { GenreRow } from '@/entities/genre/ui/GenreRow';
import { genreTableColumns } from '@/entities/genre/model/columns';
import { CreateGenreModal } from '@/features/genre/create/ui/CreateGenreModal';
import { EditGenreModal } from '@/features/genre/edit/ui/EditGenreModal';
import { DeleteGenreModal } from '@/features/genre/delete/ui/DeleteGenreModal';

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
    { value: 'Name',        label: 'Genre Name (A-Z)' },
    { value: 'TracksCount', label: 'Tracks Total Count' },
    { value: 'CreatedAt',   label: 'Date Created' },
];

export const GenresPage = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch]           = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [sortBy, setSortBy]       = useState<string | undefined>(undefined);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Стани модальних вікон та чекбоксів
    const [isCreateOpen, setIsCreateOpen]   = useState(false);
    const [editingGenre, setEditingGenre]   = useState<GenreListItemDto | null>(null);
    const [deletingGenre, setDeletingGenre] = useState<GenreListItemDto | null>(null);
    const [selectedIds, setSelectedIds]     = useState<Set<string>>(new Set());

    // Мемоізація параметрів запиту до API за спільним шаблоном
    const queryParams: GetApiAdminGenresParams = useMemo(() => ({
        Page: page,
        PageSize: PAGE_SIZE,
        SearchTerm: search || undefined,
        SortBy: sortBy,
        SortOrder: sortBy ? sortOrder : undefined,
    }), [page, search, sortBy, sortOrder]);

    const { data, isLoading, isError, refetch } = useGetApiAdminGenres(queryParams as any);

    const responseData = (data as any)?.data || data as any;
    const genres: GenreListItemDto[] = responseData?.items ?? [];
    const totalPages  = responseData?.totalPages  ?? 1;
    const totalCount  = responseData?.totalCount   ?? 0;

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
                title="Genres"
                subtitle={`Manage music genres, metadata, and classification tracks (${totalCount} layers)`}
                columns={genreTableColumns}
                onNewClick={() => setIsCreateOpen(true)}
                searchPlaceholder="Search genres by name..."
                searchValue={searchInput}
                onSearchChange={(e) => setSearchInput(e.target.value)}
                onSearchKeyDown={handleSearchKeyDown}
                onSearchClear={handleClearSearch}
                sortOptions={SORT_OPTIONS}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                isAllSelected={selectedIds.size === genres.length && genres.length > 0}
                onSelectAll={() => {
                    if (selectedIds.size === genres.length) {
                        setSelectedIds(new Set());
                    } else {
                        setSelectedIds(new Set(genres.map(g => g.id!)));
                    }
                }}
                selectedCount={selectedIds.size}
                pagination={<Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
            >
                {isLoading ? (
                    <tr>
                        <td colSpan={genreTableColumns.length + 2} className="text-center py-5">
                            <div className="spinner-border text-primary" role="status" />
                            <div className="text-secondary mt-2 small">Fetching cluster genres...</div>
                        </td>
                    </tr>
                ) : isError ? (
                    <tr>
                        <td colSpan={genreTableColumns.length + 2} className="text-center py-5 text-danger small">
                            Error loading system genre catalog.
                        </td>
                    </tr>
                ) : genres.length === 0 ? (
                    <tr>
                        <td colSpan={genreTableColumns.length + 2} className="text-center py-5 text-secondary small">
                            {search ? `No genres found matching "${search}"` : 'No genres registered in the system.'}
                        </td>
                    </tr>
                ) : (
                    genres.map((genre) => (
                        <GenreRow
                            key={genre.id}
                            genre={genre}
                            isSelected={selectedIds.has(genre.id!)}
                            onSelect={() => handleToggleSelect(genre.id!)}
                            onEdit={setEditingGenre}
                            onDelete={setDeletingGenre}
                        />
                    ))
                )}
            </BaseTable>

            <CreateGenreModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={refetch}
            />

            {editingGenre && (
                <EditGenreModal
                    genre={editingGenre}
                    isOpen={!!editingGenre}
                    onClose={() => setEditingGenre(null)}
                    onSuccess={() => { refetch(); setEditingGenre(null); }}
                />
            )}

            {deletingGenre && (
                <DeleteGenreModal
                    genre={deletingGenre}
                    isOpen={!!deletingGenre}
                    onClose={() => setDeletingGenre(null)}
                    onSuccess={() => { refetch(); setDeletingGenre(null); }}
                />
            )}
        </>
    );
};