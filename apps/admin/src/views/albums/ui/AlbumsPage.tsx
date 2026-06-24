'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
    useGetApiAdminAlbums,
    getApiAdminArtists,
    type AlbumListItemDto,
    type GetApiAdminAlbumsParams,
} from '@repo/api/admin.ts';
import { BaseTable } from '@/shared/ui/Table/BaseTable';
import { Pagination } from '@/shared/ui/Pagination';
import { AlbumRow } from '@/entities/album/ui/AlbumRow';
import { albumTableColumns } from '@/entities/album/model/columns';
import { CreateAlbumModal } from '@/features/album/create/ui/CreateAlbumModal';
import { EditAlbumModal } from '@/features/album/edit/ui/EditAlbumModal';
import { DeleteAlbumModal } from '@/features/album/delete/ui/DeleteAlbumModal';
import type { SelectOption } from '@/shared/ui/AsyncSelect/AsyncSelect';

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
    { value: 'Title',       label: 'Album Title (A-Z)' },
    { value: 'ReleaseDate', label: 'Release Date' },
    { value: 'TotalPlays',  label: 'Total Plays Count' },
    { value: 'CreatedAt',   label: 'Date Created' },
];

export const AlbumsPage = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch]           = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [sortBy, setSortBy]       = useState<string | undefined>(undefined);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Состояния модальных окон и селектора
    const [isCreateOpen, setIsCreateOpen]   = useState(false);
    const [editingAlbum, setEditingAlbum]   = useState<AlbumListItemDto | null>(null);
    const [deletingAlbum, setDeletingAlbum] = useState<AlbumListItemDto | null>(null);
    const [selectedIds, setSelectedIds]     = useState<Set<string>>(new Set());

    // Мемоизация параметров запроса к API
    const queryParams: GetApiAdminAlbumsParams = useMemo(() => ({
        Page: page,
        PageSize: PAGE_SIZE,
        SearchTerm: search || undefined,
        SortBy: sortBy,
        SortOrder: sortBy ? sortOrder : undefined,
    }), [page, search, sortBy, sortOrder]);

    const { data, isLoading, isError, refetch } = useGetApiAdminAlbums(queryParams);

    const responseData = (data as any)?.data || (data as any);
    const albums: AlbumListItemDto[] = responseData?.items ?? [];
    const totalPages = responseData?.totalPages ?? 1;
    const totalCount = responseData?.totalCount ?? 0;

    // Управление чекбоксами
    const handleToggleSelect = useCallback((id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    // Поиск
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

    // Сортировка
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

    // Автокомплит артистов (используется внутри модалок)
    const searchArtists = useCallback(async (term: string): Promise<SelectOption[]> => {
        if (!term.trim()) return [];
        try {
            const res = await getApiAdminArtists({ SearchTerm: term, PageSize: 20 } as any);
            const d = (res as any)?.data || res;
            return (d?.items ?? []).map((a: any) => ({ id: a.id, label: a.name }));
        } catch { return []; }
    }, []);

    return (
        <>
            <BaseTable
                title="Albums"
                subtitle={`Manage music albums, releases and publishing timelines (${totalCount} layers)`}
                columns={albumTableColumns}
                onNewClick={() => setIsCreateOpen(true)}
                searchPlaceholder="Search albums by title..."
                searchValue={searchInput}
                onSearchChange={(e) => setSearchInput(e.target.value)}
                onSearchKeyDown={handleSearchKeyDown}
                onSearchClear={handleClearSearch}
                sortOptions={SORT_OPTIONS}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                isAllSelected={selectedIds.size === albums.length && albums.length > 0}
                onSelectAll={() => {
                    if (selectedIds.size === albums.length) {
                        setSelectedIds(new Set());
                    } else {
                        setSelectedIds(new Set(albums.map(a => a.id!)));
                    }
                }}
                selectedCount={selectedIds.size}
                pagination={<Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
            >
                {isLoading ? (
                    <tr>
                        <td colSpan={albumTableColumns.length + 2} className="text-center py-5">
                            <div className="spinner-border text-primary" role="status" />
                            <div className="text-secondary mt-2 small">Fetching release schemas...</div>
                        </td>
                    </tr>
                ) : isError ? (
                    <tr>
                        <td colSpan={albumTableColumns.length + 2} className="text-center py-5 text-danger small">
                            Error loading system album catalog.
                        </td>
                    </tr>
                ) : albums.length === 0 ? (
                    <tr>
                        <td colSpan={albumTableColumns.length + 2} className="text-center py-5 text-secondary small">
                            {search ? `No albums found matching "${search}"` : 'No albums registered in the system.'}
                        </td>
                    </tr>
                ) : (
                    albums.map(album => (
                        <AlbumRow
                            key={album.id}
                            album={album}
                            isSelected={selectedIds.has(album.id!)}
                            onSelect={() => handleToggleSelect(album.id!)}
                            onEdit={setEditingAlbum}
                            onDelete={setDeletingAlbum}
                        />
                    ))
                )}
            </BaseTable>

            <CreateAlbumModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={refetch}
                onSearchArtists={searchArtists}
            />

            {editingAlbum && (
                <EditAlbumModal
                    album={editingAlbum}
                    isOpen={!!editingAlbum}
                    onClose={() => setEditingAlbum(null)}
                    onSuccess={() => { refetch(); setEditingAlbum(null); }}
                    onSearchArtists={searchArtists}
                />
            )}

            {deletingAlbum && (
                <DeleteAlbumModal
                    album={deletingAlbum}
                    isOpen={!!deletingAlbum}
                    onClose={() => setDeletingAlbum(null)}
                    onSuccess={() => { refetch(); setDeletingAlbum(null); }}
                />
            )}
        </>
    );
};