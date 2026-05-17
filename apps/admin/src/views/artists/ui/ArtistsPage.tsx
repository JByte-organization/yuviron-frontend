'use client';

import React, { useState } from 'react';
import {
    useGetApiAdminArtists,
    type ArtistListItemDto,
    type ArtistListItemDtoPaginatedList,
    type GetApiAdminArtistsParams,
    VerificationStatus,
} from '@repo/api';
import { BaseTable } from '@/shared/ui/Table/BaseTable';
import { ArtistRow } from '@/entities/artist/ui/ArtistRow';
import { artistTableColumns } from '@/entities/artist/model/columns';
import { CreateArtistModal } from '@/features/artist/create/ui/CreateArtistModal';
import { EditArtistModal } from '@/features/artist/edit/ui/EditArtistModal';
import { Pagination } from '@/shared/ui/Pagination';

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
    { value: 'name',      label: 'Name (A-Z)'    },
    { value: 'createdAt', label: 'Date Created'   },
    { value: 'updatedAt', label: 'Date Updated'   },
];

const VERIFICATION_STATUS_OPTIONS = [
    { value: VerificationStatus.None,     label: 'None'     },
    { value: VerificationStatus.Pending,  label: 'Pending'  },
    { value: VerificationStatus.Verified, label: 'Verified' },
    { value: VerificationStatus.Rejected, label: 'Rejected' },
];

interface FilterState {
    verificationStatuses: string[];
}

const EMPTY_FILTERS: FilterState = { verificationStatuses: [] };

export const ArtistsPage = () => {
    // ─── Модалки ──────────────────────────────────────────
    const [isCreateOpen,   setIsCreateOpen]   = useState(false);
    const [editingArtist,  setEditingArtist]  = useState<ArtistListItemDto | null>(null);
    const [selectedIds,    setSelectedIds]    = useState<Set<string>>(new Set());

    // ─── Пагінація ────────────────────────────────────────
    const [page, setPage] = useState(1);

    // ─── Пошук ────────────────────────────────────────────
    const [search,      setSearch]      = useState('');
    const [searchInput, setSearchInput] = useState('');

    // ─── Сортування ───────────────────────────────────────
    const [sortBy,    setSortBy]    = useState<string | undefined>(undefined);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // ─── Фільтри ──────────────────────────────────────────
    const [draftFilters,  setDraftFilters]  = useState<FilterState>(EMPTY_FILTERS);
    const [activeFilters, setActiveFilters] = useState<FilterState>(EMPTY_FILTERS);

    const activeFiltersCount = activeFilters.verificationStatuses.length > 0 ? 1 : 0;

    // ─── Запит ────────────────────────────────────────────
    const queryParams: GetApiAdminArtistsParams = {
        Page:               page,
        PageSize:           PAGE_SIZE,
        SearchTerm:         search || undefined,
        SortBy:             sortBy,
        SortOrder:          sortBy ? sortOrder : undefined,
        VerificationStatus: activeFilters.verificationStatuses.length === 1
            ? activeFilters.verificationStatuses[0] as typeof VerificationStatus[keyof typeof VerificationStatus]
            : undefined,
    };

    const { data, isLoading, isError, refetch } = useGetApiAdminArtists(queryParams);

    const responseData = data as ArtistListItemDtoPaginatedList | undefined;
    const artists    = responseData?.items ?? [];
    const totalPages = responseData?.totalPages ?? 1;
    const totalCount = responseData?.totalCount ?? 0;

    // ─── Handlers ─────────────────────────────────────────
    const handleToggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleSearch = () => { setPage(1); setSearch(searchInput); };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter')  handleSearch();
        if (e.key === 'Escape') { setSearchInput(''); setSearch(''); setPage(1); }
    };

    const handleClearSearch = () => { setSearchInput(''); setSearch(''); setPage(1); };

    const handleSortChange = (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
        if (sortBy === newSortBy && sortOrder === newSortOrder) {
            setSortBy(undefined);
            setSortOrder('asc');
        } else {
            setSortBy(newSortBy);
            setSortOrder(newSortOrder);
        }
        setPage(1);
    };

    const handleApplyFilters  = () => { setActiveFilters({ ...draftFilters }); setPage(1); };
    const handleResetFilters  = () => { setDraftFilters(EMPTY_FILTERS); setActiveFilters(EMPTY_FILTERS); setPage(1); };

    const toggleVerificationStatus = (value: string) => {
        setDraftFilters(prev => ({
            ...prev,
            verificationStatuses: prev.verificationStatuses.includes(value)
                ? prev.verificationStatuses.filter(v => v !== value)
                : [...prev.verificationStatuses, value],
        }));
    };

    // ─── Filter content ───────────────────────────────────
    const filterContent = (
        <div className="d-flex flex-column gap-4">
            <div>
                <p className="text-secondary small fw-semibold text-uppercase mb-2">
                    Verification Status
                </p>
                <div className="d-flex flex-column gap-2">
                    {VERIFICATION_STATUS_OPTIONS.map((opt) => (
                        <label key={opt.value} className="d-flex align-items-center gap-2">
                            <input
                                type="checkbox"
                                className="form-check-input bg-dark border-secondary"
                                checked={draftFilters.verificationStatuses.includes(opt.value)}
                                onChange={() => toggleVerificationStatus(opt.value)}
                            />
                            <span className="text-white">{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <>
            <BaseTable
                title="Artists"
                subtitle={`Manage creators (Total: ${totalCount})`}
                columns={artistTableColumns}
                onNewClick={() => setIsCreateOpen(true)}
                searchPlaceholder="Search by name or email..."
                searchValue={searchInput}
                onSearchChange={(e) => setSearchInput(e.target.value)}
                onSearchKeyDown={handleSearchKeyDown}
                onSearchClear={handleClearSearch}
                filterContent={filterContent}
                onApplyFilters={handleApplyFilters}
                onResetFilters={handleResetFilters}
                activeFiltersCount={activeFiltersCount}
                sortOptions={SORT_OPTIONS}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                isAllSelected={selectedIds.size === artists.length && artists.length > 0}
                onSelectAll={() => {
                    if (selectedIds.size === artists.length) {
                        setSelectedIds(new Set());
                    } else {
                        setSelectedIds(new Set(artists.map(a => a.id!)));
                    }
                }}
                selectedCount={selectedIds.size}
                pagination={
                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                }
            >
                {isLoading ? (
                    <tr>
                        <td colSpan={artistTableColumns.length + 2} className="text-center py-5">
                            <div className="spinner-border text-primary" role="status" />
                            <div className="text-secondary mt-2">Fetching artists...</div>
                        </td>
                    </tr>
                ) : isError ? (
                    <tr>
                        <td colSpan={artistTableColumns.length + 2} className="text-center py-5 text-danger">
                            Error loading artists.
                        </td>
                    </tr>
                ) : artists.length === 0 ? (
                    <tr>
                        <td colSpan={artistTableColumns.length + 2} className="text-center py-5 text-secondary">
                            {search ? `No artists found for "${search}"` : 'No artists found.'}
                        </td>
                    </tr>
                ) : (
                    artists.map((artist) => (
                        <ArtistRow
                            key={artist.id}
                            artist={artist}
                            isSelected={selectedIds.has(artist.id!)}
                            onSelect={() => handleToggleSelect(artist.id!)}
                            onEdit={setEditingArtist}
                            onDelete={(a) => console.log('delete', a)}
                        />
                    ))
                )}
            </BaseTable>

            <CreateArtistModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={() => { refetch(); setIsCreateOpen(false); }}
            />

            <EditArtistModal
                artist={editingArtist}
                isOpen={!!editingArtist}
                onClose={() => setEditingArtist(null)}
                onSuccess={() => { refetch(); setEditingArtist(null); }}
            />
        </>
    );
};