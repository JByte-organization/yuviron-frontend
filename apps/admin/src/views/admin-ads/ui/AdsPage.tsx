'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
    useGetApiAdminAds,
    usePatchApiAdminAdsIdStatus,
    type AdSummaryDto,
    type AdSummaryDtoPaginatedList,
    type GetApiAdminAdsParams
} from '@repo/api/admin.ts';
import { BaseTable } from '@/shared/ui/Table/BaseTable';
import { AdRow } from '@/entities/ad/ui/AdRow';
import { CreateAdModal } from '@/features/ad/create/ui/CreateAdModal';
import { EditAdModal } from '@/features/ad/edit/ui/EditAdModal';
import { DeleteAdModal } from '@/features/ad/delete/ui/DeleteAdModal';
import { Pagination } from '@/shared/ui/Pagination';
import { useAdPlayback } from '@/features/ad/playback/model/useAdPlayback';

const PAGE_SIZE = 15;
const COLUMNS = ['Brand / Campaign', 'Impressions', 'Clicks', 'CTR', 'Status', 'Created At'];

const SORT_OPTIONS = [
    { value: 'CreatedAt', label: 'Date Created' },
    { value: 'ImpressionsCount', label: 'Total Impressions' },
    { value: 'ClicksCount', label: 'Total Clicks' },
];

export const AdsPage = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');

    const [sortBy, setSortBy] = useState<string>('CreatedAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [tempStatus, setTempStatus] = useState<string>('all');

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingAd, setEditingAd] = useState<AdSummaryDto | null>(null);
    const [deletingAd, setDeletingAd] = useState<AdSummaryDto | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const { mutateAsync: toggleAdStatus } = usePatchApiAdminAdsIdStatus();
    const { playingAdId, loadingAdId, handlePlayToggle } = useAdPlayback();

    // ─── МЕМОИЗАЦИЯ КЛИЕНТСКОГО ЗАПРОСА ───────────────────
    const queryParams: GetApiAdminAdsParams = useMemo(() => ({
        Page: page,
        PageSize: PAGE_SIZE,
        SearchTerm: search.trim() || undefined,
        SortBy: sortBy || undefined,
        SortOrder: sortOrder || undefined
    }), [page, search, sortBy, sortOrder]);

    const { data, isLoading, isError, refetch } = useGetApiAdminAds(queryParams);

    const responseData = (data as { data?: AdSummaryDtoPaginatedList } | undefined)?.data
        ?? (data as AdSummaryDtoPaginatedList | undefined);

    const rawAdsList = responseData?.items ?? [];
    const totalPages = responseData?.totalPages ?? 1;
    const totalCount = responseData?.totalCount ?? 0;

    const adsList = useMemo(() => {
        return rawAdsList.filter(ad => {
            if (statusFilter === 'active') return ad.isActive === true;
            if (statusFilter === 'inactive') return ad.isActive === false;
            return true;
        });
    }, [rawAdsList, statusFilter]);

    // ─── СИНХРОННЫЕ МЕМОИЗИРОВАННЫЕ ХЕНДЛЕРЫ ──────────────
    const handleSelectAll = useCallback(() => {
        if (selectedIds.size === adsList.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(adsList.map(ad => ad.id).filter(Boolean) as string[]));
        }
    }, [adsList, selectedIds]);

    const handleToggleSelect = useCallback((id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const handleSwitchActive = useCallback(async (ad: AdSummaryDto) => {
        if (!ad.id) return;
        try {
            await toggleAdStatus({
                id: ad.id,
                data: { adId: ad.id, isActive: !ad.isActive } as Parameters<typeof toggleAdStatus>[0]['data']
            });
            refetch();
        } catch (err) {
            console.error(err);
        }
    }, [toggleAdStatus, refetch]);

    const handleApplyFilters = useCallback(() => { setStatusFilter(tempStatus); setPage(1); }, [tempStatus]);
    const handleResetFilters = useCallback(() => { setTempStatus('all'); setStatusFilter('all'); setPage(1); }, []);
    const handleSortChange = useCallback((field: string, order: 'asc' | 'desc') => { setSortBy(field); setSortOrder(order); setPage(1); }, []);

    const filterContent = useMemo(() => (
        <div className="d-flex flex-column gap-3 p-1">
            <div>
                <label className="form-label text-secondary small fw-bold mb-2" style={{ fontSize: '11px' }}>
                    CAMPAIGN STATUS
                </label>
                <select
                    className="form-select bg-dark text-white border-secondary shadow-none"
                    value={tempStatus}
                    onChange={(e) => setTempStatus(e.target.value)}
                >
                    <option value="all">All Campaigns</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Paused Only</option>
                </select>
            </div>
        </div>
    ), [tempStatus]);

    return (
        <>
            <BaseTable
                title="Audio Ads"
                subtitle={`Targeted promotional audio payloads inside free playback loops (Total items: ${totalCount})`}
                columns={COLUMNS}
                onNewClick={() => setIsCreateOpen(true)}
                searchValue={search}
                searchPlaceholder="Search campaigns or brands..."
                onSearchChange={(e) => { setSearch(e.target.value); setPage(1); }}
                onSearchClear={() => { setSearch(''); setPage(1); }}
                sortOptions={SORT_OPTIONS}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                filterContent={filterContent}
                onApplyFilters={handleApplyFilters}
                onResetFilters={handleResetFilters}
                activeFiltersCount={statusFilter !== 'all' ? 1 : 0}
                selectedCount={selectedIds.size}
                isAllSelected={adsList.length > 0 && selectedIds.size === adsList.length}
                onSelectAll={handleSelectAll}
                pagination={<Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
            >
                {isLoading ? (
                    <tr><td colSpan={COLUMNS.length + 2} className="text-center py-5"><div className="spinner-border text-primary" /></td></tr>
                ) : isError ? (
                    <tr><td colSpan={COLUMNS.length + 2} className="text-center py-5 text-danger fw-semibold">Critical error syncing with database.</td></tr>
                ) : adsList.length === 0 ? (
                    <tr><td colSpan={COLUMNS.length + 2} className="text-center py-5 text-secondary">No marketing campaigns found matching criteria.</td></tr>
                ) : (
                    adsList.map((ad) => ad.id && (
                        <AdRow
                            key={ad.id}
                            ad={ad}
                            isSelected={selectedIds.has(ad.id)}
                            isPlaying={playingAdId === ad.id}
                            isLoading={loadingAdId === ad.id}
                            onSelect={() => handleToggleSelect(ad.id!)}
                            onEdit={setEditingAd}
                            onDelete={setDeletingAd}
                            onPlayToggle={handlePlayToggle}
                            onToggleStatus={handleSwitchActive}
                        />
                    ))
                )}
            </BaseTable>

            <CreateAdModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={() => { refetch(); setIsCreateOpen(false); }} />
            {editingAd && <EditAdModal ad={editingAd} isOpen={!!editingAd} onClose={() => setEditingAd(null)} onSuccess={() => { refetch(); setEditingAd(null); }} />}
            {deletingAd && <DeleteAdModal ad={deletingAd} isOpen={!!deletingAd} onClose={() => setDeletingAd(null)} onSuccess={() => { refetch(); setDeletingAd(null); }} />}
        </>
    );
};