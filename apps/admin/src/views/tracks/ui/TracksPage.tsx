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
import { Pagination } from '@/shared/ui/Pagination';
import type { SelectOption } from '@/shared/ui/AsyncSelect/AsyncSelect';
import { useTrackPlayback } from '@/features/track/playback/model/useTrackPlayback';

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
    { value: 'Title', label: 'Track Title' },
    { value: 'PlayCount', label: 'Most Played' },
    { value: 'CreatedAt', label: 'Date Added' },
];

export const TracksPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<string>('CreatedAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [visibilityFilter, setVisibilityFilter] = useState<string>('all');
    const [tempVisibility, setTempVisibility] = useState<string>('all');

    const [isCreateOpen,  setIsCreateOpen]  = useState(false);
    const [editingTrack,  setEditingTrack]  = useState<TrackListItemDto | null>(null);
    const [deletingTrack, setDeletingTrack] = useState<TrackListItemDto | null>(null);
    const [selectedIds,   setSelectedIds]   = useState<Set<string>>(new Set());

    // 🚨 ПІДКЛЮЧАЄМО ОНОВЛЕНИЙ ХУК ПЛЕЄРА З ЛОАДЕРОМ
    const { playingTrackId, loadingTrackId, handlePlayToggle } = useTrackPlayback();

    const { data, isLoading, isError, refetch } = useGetApiAdminTracks({
        Page: currentPage,
        PageSize: PAGE_SIZE,
        SearchTerm: search.trim() || undefined,
        SortBy: sortBy || undefined,
        SortOrder: sortOrder || undefined
    } as any);

    const responseData = (data as any)?.data || (data as any);
    const rawTracks: TrackListItemDto[] = responseData?.items ?? [];
    const totalPages = responseData?.totalPages ?? 1;
    const totalCount = responseData?.totalCount ?? 0;

    const tracks = rawTracks.filter(track => {
        if (visibilityFilter === 'all') return true;
        return track.visibilityStatus === visibilityFilter;
    });

    const handleSelectAll = () => {
        if (selectedIds.size === tracks.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(tracks.map(t => t.id).filter(Boolean) as string[]));
        }
    };

    const handleToggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleApplyFilters = () => {
        setVisibilityFilter(tempVisibility);
        setCurrentPage(1);
    };

    const handleResetFilters = () => {
        setTempVisibility('all');
        setVisibilityFilter('all');
        setCurrentPage(1);
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

    const filterContent = (
        <div className="d-flex flex-column gap-3 p-1">
            <div>
                <label className="form-label text-secondary small fw-bold mb-2" style={{ fontSize: '11px' }}>
                    TRACK VISIBILITY
                </label>
                <select
                    className="form-select bg-dark text-white border-secondary shadow-none"
                    value={tempVisibility}
                    onChange={(e) => setTempVisibility(e.target.value)}
                >
                    <option value="all">All Visibility States</option>
                    <option value="Published">Published Only</option>
                    <option value="Draft">Drafts Only</option>
                    <option value="Scheduled">Scheduled Only</option>
                    <option value="Hidden">Hidden Only</option>
                </select>
            </div>
        </div>
    );

    return (
        <>
            <BaseTable
                title="Tracks"
                subtitle={`Manage music tracks (Total: ${totalCount})`}
                columns={trackTableColumns}
                onNewClick={() => setIsCreateOpen(true)}

                searchValue={search}
                searchPlaceholder="Search by title, brand or artist..."
                onSearchChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                onSearchClear={() => { setSearch(''); setCurrentPage(1); }}

                sortOptions={SORT_OPTIONS}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={(field, order) => { setSortBy(field); setSortOrder(order as 'asc' | 'desc'); setCurrentPage(1); }}

                filterContent={filterContent}
                onApplyFilters={handleApplyFilters}
                onResetFilters={handleResetFilters}
                activeFiltersCount={visibilityFilter !== 'all' ? 1 : 0}

                selectedCount={selectedIds.size}
                isAllSelected={tracks.length > 0 && selectedIds.size === tracks.length}
                onSelectAll={handleSelectAll}
                onDeleteSelected={() => {}}

                pagination={<Pagination page={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
            >
                {isLoading ? (
                    <tr><td colSpan={trackTableColumns.length + 2} className="text-center py-5"><div className="spinner-border text-primary" /></td></tr>
                ) : isError ? (
                    <tr><td colSpan={trackTableColumns.length + 2} className="text-center py-5 text-danger fw-semibold">Critical error loading tracks metadata.</td></tr>
                ) : tracks.length === 0 ? (
                    <tr><td colSpan={trackTableColumns.length + 2} className="text-center py-5 text-secondary">No tracks found matching current filter criteria.</td></tr>
                ) : (
                    tracks.map(track => track.id && (
                        <TrackRow
                            key={track.id}
                            track={track}
                            isSelected={selectedIds.has(track.id)}
                            isPlaying={playingTrackId === track.id}
                            isLoading={loadingTrackId === track.id}
                            onSelect={() => handleToggleSelect(track.id!)}
                            onEdit={setEditingTrack}
                            onDelete={setDeletingTrack}
                            onPlayToggle={handlePlayToggle}
                        />
                    ))
                )}
            </BaseTable>

            <CreateTrackModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={refetch} {...searchProps} />
            <EditTrackModal track={editingTrack} isOpen={!!editingTrack} onClose={() => setEditingTrack(null)} onSuccess={() => { refetch(); setEditingTrack(null); }} {...searchProps} />
            <DeleteTrackModal track={deletingTrack} isOpen={!!deletingTrack} onClose={() => setDeletingTrack(null)} onSuccess={() => { refetch(); setDeletingTrack(null); }} />
        </>
    );
};