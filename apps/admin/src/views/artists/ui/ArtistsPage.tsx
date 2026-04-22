'use client';

import React, { useState } from 'react';
import { useGetApiAdminArtists, type ArtistListItemDto } from '@repo/api';
import { BaseTable } from '@/shared/ui/Table/BaseTable';
import { ArtistRow } from '@/entities/artist/ui/ArtistRow';
import { artistTableColumns } from '@/entities/artist/model/columns';
import { CreateArtistModal } from '@/features/artist/create/ui/CreateArtistModal';
import { EditArtistModal } from '@/features/artist/edit/ui/EditArtistModal';

export const ArtistsPage = () => {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingArtist, setEditingArtist] = useState<ArtistListItemDto | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);

    const { data, isLoading, isError, refetch } = useGetApiAdminArtists({
        Page: currentPage,
        PageSize: 20,
    } as any);

    const responseData = data as any;
    const artists = responseData?.Items || responseData?.items || [];
    const totalPages = responseData?.TotalPages || responseData?.totalPages || 1;
    const hasNext = responseData?.HasNextPage || responseData?.hasNextPage || false;
    const hasPrev = responseData?.HasPreviousPage || responseData?.hasPreviousPage || false;
    const totalCount = responseData?.TotalCount || responseData?.totalCount || 0;

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
                title="Artists"
                subtitle={`Manage creators (Total: ${totalCount})`}
                columns={artistTableColumns}
                onNewClick={() => setIsCreateOpen(true)}
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
                        <td colSpan={artistTableColumns.length} className="text-center py-5">
                            <div className="spinner-border text-primary" />
                        </td>
                    </tr>
                ) : isError ? (
                    <tr>
                        <td colSpan={artistTableColumns.length} className="text-center py-5 text-danger">
                            Error loading artists.
                        </td>
                    </tr>
                ) : (
                    artists.map((artist: any) => (
                        <ArtistRow
                            key={artist.id || artist.Id}
                            artist={artist}
                            isSelected={selectedIds.has(artist.id || artist.Id)}
                            onSelect={() => handleToggleSelect(artist.id || artist.Id)}
                            onEdit={setEditingArtist}     // ← передаём
                            onDelete={(a) => console.log('delete', a)} // ← заглушка до DeleteModal
                        />
                    ))
                )}
            </BaseTable>

            <CreateArtistModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={refetch}
            />

            {/* Модалка редактирования */}
            <EditArtistModal
                artist={editingArtist}
                isOpen={!!editingArtist}
                onClose={() => setEditingArtist(null)}
                onSuccess={() => { refetch(); setEditingArtist(null); }}
            />
        </>
    );
};