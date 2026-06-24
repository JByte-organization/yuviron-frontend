'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
    useGetApiAdminPlaylists,
    getApiAdminUsers,
    type PlaylistDto,
} from '@repo/api/admin.ts';
import { BaseTable } from '@/shared/ui/Table/BaseTable';
import { Pagination } from '@/shared/ui/Pagination';
import { PlaylistRow } from '@/entities/playlist/ui/PlaylistRow';
import { playlistTableColumns } from '@/entities/playlist/model/columns';
import { CreatePlaylistModal } from '@/features/playlist/create/ui/CreatePlaylistModal';
import { EditPlaylistModal } from '@/features/playlist/edit/ui/EditPlaylistModal';
import { DeletePlaylistModal } from '@/features/playlist/delete/ui/DeletePlaylistModal';
import type { SelectOption } from '@/shared/ui/AsyncSelect/AsyncSelect';

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
    { value: 'Title',       label: 'Playlist Title (A-Z)' },
    { value: 'TracksCount', label: 'Tracks Total Count' },
    { value: 'CreatedAt',   label: 'Date Created' },
];

export const PlaylistsPage = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch]           = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [sortBy, setSortBy]       = useState<string | undefined>(undefined);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Стани модальних вікон та виділених елементів
    const [isCreateOpen, setIsCreateOpen]     = useState(false);
    const [editingPlaylist, setEditingPlaylist]   = useState<PlaylistDto | null>(null);
    const [deletingPlaylist, setDeletingPlaylist] = useState<PlaylistDto | null>(null);
    const [selectedIds, setSelectedIds]           = useState<Set<string>>(new Set());

    // Мемоізація уніфікованих параметрів для TanStack Query
    const queryParams = useMemo(() => ({
        Page: page,
        PageSize: PAGE_SIZE,
        SearchTerm: search || undefined,
        SortBy: sortBy,
        SortOrder: sortBy ? sortOrder : undefined,
    }), [page, search, sortBy, sortOrder]);

    const { data, isLoading, isError, refetch } = useGetApiAdminPlaylists(queryParams as any);

    const responseData = (data as any)?.data || (data as any);
    const playlists: PlaylistDto[] = responseData?.items ?? [];
    const totalPages = responseData?.totalPages ?? 1;
    const totalCount = responseData?.totalCount ?? 0;

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

    // Автокомплит користувачів
    const searchUsers = useCallback(async (term: string): Promise<SelectOption[]> => {
        if (!term.trim()) return [];
        try {
            const res = await getApiAdminUsers({ SearchTerm: term, PageSize: 20 } as any);
            const d = (res as any)?.data || res;
            return (d?.items ?? []).map((u: any) => ({
                id: u.id,
                label: u.firstName ? `${u.firstName} (${u.email})` : u.email,
            }));
        } catch { return []; }
    }, []);

    return (
        <>
            <BaseTable
                title="Playlists"
                subtitle={`Manage system playlists, editorial tracks curation, and coverage flags (${totalCount} layers)`}
                columns={playlistTableColumns}
                onNewClick={() => setIsCreateOpen(true)}
                searchPlaceholder="Search playlists by title or creator..."
                searchValue={searchInput}
                onSearchChange={(e) => setSearchInput(e.target.value)}
                onSearchKeyDown={handleSearchKeyDown}
                onSearchClear={handleClearSearch}
                sortOptions={SORT_OPTIONS}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                isAllSelected={selectedIds.size === playlists.length && playlists.length > 0}
                onSelectAll={() => {
                    if (selectedIds.size === playlists.length) {
                        setSelectedIds(new Set());
                    } else {
                        setSelectedIds(new Set(playlists.map(p => p.id!)));
                    }
                }}
                selectedCount={selectedIds.size}
                pagination={<Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
            >
                {isLoading ? (
                    <tr>
                        <td colSpan={playlistTableColumns.length + 2} className="text-center py-5">
                            <div className="spinner-border text-primary" role="status" />
                            <div className="text-secondary mt-2 small">Fetching cluster playlists...</div>
                        </td>
                    </tr>
                ) : isError ? (
                    <tr>
                        <td colSpan={playlistTableColumns.length + 2} className="text-center py-5 text-danger small">
                            Error loading system playlist catalog.
                        </td>
                    </tr>
                ) : playlists.length === 0 ? (
                    <tr>
                        <td colSpan={playlistTableColumns.length + 2} className="text-center py-5 text-secondary small">
                            {search ? `No playlists found matching "${search}"` : 'No playlists registered in the system.'}
                        </td>
                    </tr>
                ) : (
                    playlists.map(playlist => (
                        <PlaylistRow
                            key={playlist.id}
                            playlist={playlist}
                            isSelected={selectedIds.has(playlist.id!)}
                            onSelect={() => handleToggleSelect(playlist.id!)}
                            onEdit={setEditingPlaylist}
                            onDelete={setDeletingPlaylist}
                        />
                    ))
                )}
            </BaseTable>

            <CreatePlaylistModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={refetch}
                onSearchUsers={searchUsers}
            />

            {editingPlaylist && (
                <EditPlaylistModal
                    playlist={editingPlaylist}
                    isOpen={!!editingPlaylist}
                    onClose={() => setEditingPlaylist(null)}
                    onSuccess={() => { refetch(); setEditingPlaylist(null); }}
                    onSearchUsers={searchUsers}
                />
            )}

            {deletingPlaylist && (
                <DeletePlaylistModal
                    playlist={deletingPlaylist}
                    isOpen={!!deletingPlaylist}
                    onClose={() => setDeletingPlaylist(null)}
                    onSuccess={() => { refetch(); setDeletingPlaylist(null); }}
                />
            )}
        </>
    );
};