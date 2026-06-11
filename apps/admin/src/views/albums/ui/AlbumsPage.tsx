'use client';

import React, { useState, useCallback } from 'react';
import {
    useGetApiAdminAlbums,
    getApiAdminArtists,
    type AlbumListItemDto,
} from '@repo/api/admin.ts';
import { BaseTable } from '@/shared/ui/Table/BaseTable';
import { AlbumRow } from '@/entities/album/ui/AlbumRow';
import { albumTableColumns } from '@/entities/album/model/columns';
import { CreateAlbumModal } from '@/features/album/create/ui/CreateAlbumModal';
import { EditAlbumModal } from '@/features/album/edit/ui/EditAlbumModal';
import { DeleteAlbumModal } from '@/features/album/delete/ui/DeleteAlbumModal';
import type { SelectOption } from '@/shared/ui/AsyncSelect/AsyncSelect';

export const AlbumsPage = () => {
    const [isCreateOpen,  setIsCreateOpen]  = useState(false);
    const [editingAlbum,  setEditingAlbum]  = useState<AlbumListItemDto | null>(null);
    const [deletingAlbum, setDeletingAlbum] = useState<AlbumListItemDto | null>(null);
    const [selectedIds,   setSelectedIds]   = useState<Set<string>>(new Set());
    const [currentPage,   setCurrentPage]   = useState(1);

    const { data, isLoading, isError, refetch } = useGetApiAdminAlbums({
        Page: currentPage,
        PageSize: 20,
    });

    const responseData = (data as any)?.data || (data as any);
    const albums: AlbumListItemDto[] = responseData?.items ?? [];
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
                subtitle={`Manage music albums (Total: ${totalCount})`}
                columns={albumTableColumns}
                onNewClick={() => setIsCreateOpen(true)}
                searchPlaceholder="Search by title or artist..."
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
                        <td colSpan={albumTableColumns.length + 2} className="text-center py-5">
                            <div className="spinner-border text-primary" />
                        </td>
                    </tr>
                ) : isError ? (
                    <tr>
                        <td colSpan={albumTableColumns.length + 2} className="text-center py-5 text-danger">
                            Error loading albums.
                        </td>
                    </tr>
                ) : albums.length === 0 ? (
                    <tr>
                        <td colSpan={albumTableColumns.length + 2} className="text-center py-5 text-secondary">
                            No albums found.
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
            <EditAlbumModal
                album={editingAlbum}
                isOpen={!!editingAlbum}
                onClose={() => setEditingAlbum(null)}
                onSuccess={() => { refetch(); setEditingAlbum(null); }}
                onSearchArtists={searchArtists}
            />
            <DeleteAlbumModal
                album={deletingAlbum}
                isOpen={!!deletingAlbum}
                onClose={() => setDeletingAlbum(null)}
                onSuccess={() => { refetch(); setDeletingAlbum(null); }}
            />
        </>
    );
};