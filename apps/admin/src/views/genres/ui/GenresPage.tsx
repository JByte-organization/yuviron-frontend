'use client';

import React, { useState } from 'react';
import { useGetApiAdminGenres, type GenreListItemDto } from '@repo/api';
import { BaseTable } from '@/shared/ui/Table/BaseTable';
import { GenreRow } from '@/entities/genre/ui/GenreRow';
import { genreTableColumns } from '@/entities/genre/model/columns';
import { CreateGenreModal } from '@/features/genre/create/ui/CreateGenreModal';
import { EditGenreModal } from '@/features/genre/edit/ui/EditGenreModal';
import { DeleteGenreModal } from '@/features/genre/delete/ui/DeleteGenreModal';

export const GenresPage = () => {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingGenre, setEditingGenre] = useState<GenreListItemDto | null>(null);
    const [deletingGenre, setDeletingGenre] = useState<GenreListItemDto | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);

    const { data, isLoading, isError, refetch } = useGetApiAdminGenres({
        Page: currentPage,
        PageSize: 20,
    });

    const responseData = (data as any)?.data || data as any;
    const genres: GenreListItemDto[] = responseData?.items ?? [];
    const totalPages  = responseData?.totalPages  ?? 1;
    const hasNext     = responseData?.hasNextPage  ?? false;
    const hasPrev     = responseData?.hasPreviousPage ?? false;
    const totalCount  = responseData?.totalCount   ?? 0;

    const handleToggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    return (
        <>
            <BaseTable
                title="Genres"
                subtitle={`Manage music genres (Total: ${totalCount})`}
                columns={genreTableColumns}
                onNewClick={() => setIsCreateOpen(true)}
                searchPlaceholder="Search by name or ID..."
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
                        <td colSpan={genreTableColumns.length} className="text-center py-5">
                            <div className="spinner-border text-primary" />
                        </td>
                    </tr>
                ) : isError ? (
                    <tr>
                        <td colSpan={genreTableColumns.length} className="text-center py-5 text-danger">
                            Error loading genres.
                        </td>
                    </tr>
                ) : genres.length === 0 ? (
                    <tr>
                        <td colSpan={genreTableColumns.length} className="text-center py-5 text-secondary">
                            No genres found.
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

            <EditGenreModal
                genre={editingGenre}
                isOpen={!!editingGenre}
                onClose={() => setEditingGenre(null)}
                onSuccess={() => { refetch(); setEditingGenre(null); }}
            />

            <DeleteGenreModal
                genre={deletingGenre}
                isOpen={!!deletingGenre}
                onClose={() => setDeletingGenre(null)}
                onSuccess={() => { refetch(); setDeletingGenre(null); }}
            />
        </>
    );
};