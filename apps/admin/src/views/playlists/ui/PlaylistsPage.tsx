'use client';

import React, { useState, useCallback } from 'react';
import {
    useGetApiAdminPlaylists,
    getApiAdminUsers,
    type PlaylistDto,
} from '@repo/api/admin.ts';
import { BaseTable } from '@/shared/ui/Table/BaseTable';
import { PlaylistRow } from '@/entities/playlist/ui/PlaylistRow';
import { playlistTableColumns } from '@/entities/playlist/model/columns';
import { CreatePlaylistModal } from '@/features/playlist/create/ui/CreatePlaylistModal';
import { EditPlaylistModal } from '@/features/playlist/edit/ui/EditPlaylistModal';
import { DeletePlaylistModal } from '@/features/playlist/delete/ui/DeletePlaylistModal';
import type { SelectOption } from '@/shared/ui/AsyncSelect/AsyncSelect';

export const PlaylistsPage = () => {
    const [isCreateOpen,     setIsCreateOpen]     = useState(false);
    const [editingPlaylist,  setEditingPlaylist]  = useState<PlaylistDto | null>(null);
    const [deletingPlaylist, setDeletingPlaylist] = useState<PlaylistDto | null>(null);
    const [selectedIds,      setSelectedIds]      = useState<Set<string>>(new Set());
    const [currentPage,      setCurrentPage]      = useState(1);

    const { data, isLoading, isError, refetch } = useGetApiAdminPlaylists({
        Page: currentPage,
        PageSize: 20,
    });

    const responseData = (data as any)?.data || (data as any);
    const playlists: PlaylistDto[] = responseData?.items ?? [];
    const totalPages = responseData?.totalPages ?? 1;
    const hasNext    = responseData?.hasNextPage ?? false;
    const hasPrev    = responseData?.hasPreviousPage ?? false;
    const totalCount = responseData?.totalCount ?? 0;

    const handleToggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

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
                subtitle={`Manage playlists (Total: ${totalCount})`}
                columns={playlistTableColumns}
                onNewClick={() => setIsCreateOpen(true)}
                searchPlaceholder="Search by title or creator..."
                pagination={
                    <nav>
                        <ul className="pagination pagination-sm mb-0">
                            <li className={`page-item ${!hasPrev ? 'disabled' : ''}`}>
                                <button
                                    className="page-link bg-dark border-secondary text-white"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={!hasPrev}
                                >«</button>
                            </li>
                            <li className="page-item active">
                                <span className="page-link bg-primary border-primary text-dark fw-bold">
                                    {currentPage} / {totalPages}
                                </span>
                            </li>
                            <li className={`page-item ${!hasNext ? 'disabled' : ''}`}>
                                <button
                                    className="page-link bg-dark border-secondary text-white"
                                    onClick={() => setCurrentPage(p => p + 1)}
                                    disabled={!hasNext}
                                >»</button>
                            </li>
                        </ul>
                    </nav>
                }
            >
                {isLoading ? (
                    <tr>
                        <td colSpan={playlistTableColumns.length + 2} className="text-center py-5">
                            <div className="spinner-border text-primary" />
                        </td>
                    </tr>
                ) : isError ? (
                    <tr>
                        <td colSpan={playlistTableColumns.length + 2} className="text-center py-5 text-danger">
                            Error loading playlists.
                        </td>
                    </tr>
                ) : playlists.length === 0 ? (
                    <tr>
                        <td colSpan={playlistTableColumns.length + 2} className="text-center py-5 text-secondary">
                            No playlists found.
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
            <EditPlaylistModal
                playlist={editingPlaylist}
                isOpen={!!editingPlaylist}
                onClose={() => setEditingPlaylist(null)}
                onSuccess={() => { refetch(); setEditingPlaylist(null); }}
                onSearchUsers={searchUsers}
            />
            <DeletePlaylistModal
                playlist={deletingPlaylist}
                isOpen={!!deletingPlaylist}
                onClose={() => setDeletingPlaylist(null)}
                onSuccess={() => { refetch(); setDeletingPlaylist(null); }}
            />
        </>
    );
};