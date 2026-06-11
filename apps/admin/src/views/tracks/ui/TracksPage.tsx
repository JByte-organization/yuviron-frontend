'use client';

import React, { useState, useCallback } from 'react';
import {
    useGetApiAdminTracks,
    getApiAdminAlbums,
    getApiAdminArtists,
    getApiAdminGenres,
    getApiAdminMoods,
    type TrackListItemDto,
} from '@repo/api/admin.ts';
import { BaseTable } from '@/shared/ui/Table/BaseTable';
import { TrackRow } from '@/entities/track/ui/TrackRow';
import { trackTableColumns } from '@/entities/track/model/columns';
import { CreateTrackModal } from '@/features/track/create/ui/CreateTrackModal';
import { EditTrackModal } from '@/features/track/edit/ui/EditTrackModal';
import { DeleteTrackModal } from '@/features/track/delete/ui/DeleteTrackModal';
import type { SelectOption } from '@/shared/ui/AsyncSelect/AsyncSelect';

export const TracksPage = () => {
    const [isCreateOpen,  setIsCreateOpen]  = useState(false);
    const [editingTrack,  setEditingTrack]  = useState<TrackListItemDto | null>(null);
    const [deletingTrack, setDeletingTrack] = useState<TrackListItemDto | null>(null);
    const [selectedIds,   setSelectedIds]   = useState<Set<string>>(new Set());
    const [currentPage,   setCurrentPage]   = useState(1);

    const { data, isLoading, isError, refetch } = useGetApiAdminTracks({
        Page: currentPage,
        PageSize: 20,
    });

    const responseData = (data as any)?.data || (data as any);
    const tracks: TrackListItemDto[] = responseData?.items ?? [];
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

    const searchAlbums = useCallback(async (term: string): Promise<SelectOption[]> => {
        if (!term.trim()) return [];
        try {
            const res = await getApiAdminAlbums({ SearchTerm: term, PageSize: 20 });
            const d = (res as any)?.data || res;
            return (d?.items ?? []).map((a: any) => ({ id: a.id, label: a.title }));
        } catch { return []; }
    }, []);

    const searchArtists = useCallback(async (term: string): Promise<SelectOption[]> => {
        if (!term.trim()) return [];
        try {
            const res = await getApiAdminArtists({ SearchTerm: term, PageSize: 20 } as any);
            const d = (res as any)?.data || res;
            return (d?.items ?? []).map((a: any) => ({ id: a.id, label: a.name }));
        } catch { return []; }
    }, []);

    const searchGenres = useCallback(async (term: string): Promise<SelectOption[]> => {
        if (!term.trim()) return [];
        try {
            const res = await getApiAdminGenres({ SearchTerm: term, PageSize: 20 });
            const d = (res as any)?.data || res;
            return (d?.items ?? []).map((g: any) => ({ id: g.id, label: g.name }));
        } catch { return []; }
    }, []);

    const searchMoods = useCallback(async (term: string): Promise<SelectOption[]> => {
        if (!term.trim()) return [];
        try {
            const res = await getApiAdminMoods({ SearchTerm: term, PageSize: 20 });
            const d = (res as any)?.data || res;
            return (d?.items ?? []).map((m: any) => ({ id: m.id, label: m.name }));
        } catch { return []; }
    }, []);

    const searchProps = {
        onSearchArtists: searchArtists,
        onSearchGenres:  searchGenres,
        onSearchMoods:   searchMoods,
        onSearchAlbums:  searchAlbums,
    };

    return (
        <>
            <BaseTable
                title="Tracks"
                subtitle={`Manage music tracks (Total: ${totalCount})`}
                columns={trackTableColumns}
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
                        <td colSpan={trackTableColumns.length + 2} className="text-center py-5">
                            <div className="spinner-border text-primary" />
                        </td>
                    </tr>
                ) : isError ? (
                    <tr>
                        <td colSpan={trackTableColumns.length + 2} className="text-center py-5 text-danger">
                            Error loading tracks.
                        </td>
                    </tr>
                ) : tracks.length === 0 ? (
                    <tr>
                        <td colSpan={trackTableColumns.length + 2} className="text-center py-5 text-secondary">
                            No tracks found.
                        </td>
                    </tr>
                ) : (
                    tracks.map(track => (
                        <TrackRow
                            key={track.id}
                            track={track}
                            isSelected={selectedIds.has(track.id!)}
                            onSelect={() => handleToggleSelect(track.id!)}
                            onEdit={setEditingTrack}
                            onDelete={setDeletingTrack}
                        />
                    ))
                )}
            </BaseTable>

            <CreateTrackModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={refetch}
                {...searchProps}
            />
            <EditTrackModal
                track={editingTrack}
                isOpen={!!editingTrack}
                onClose={() => setEditingTrack(null)}
                onSuccess={() => { refetch(); setEditingTrack(null); }}
                {...searchProps}
            />
            <DeleteTrackModal
                track={deletingTrack}
                isOpen={!!deletingTrack}
                onClose={() => setDeletingTrack(null)}
                onSuccess={() => { refetch(); setDeletingTrack(null); }}
            />
        </>
    );
};