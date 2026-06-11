'use client';

import React, { useState } from 'react';
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

// Массив опций сортировки для выпадающего списка BaseTable
const SORT_OPTIONS = [
    { value: 'CreatedAt', label: 'Date Created' },
    { value: 'ImpressionsCount', label: 'Total Impressions' },
    { value: 'ClicksCount', label: 'Total Clicks' },
];

export const AdsPage = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');

    // Стейты сортировки (привязаны к BaseTable)
    const [sortBy, setSortBy] = useState<string>('CreatedAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Стейты фильтрации: основной и временный (для бокового меню)
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [tempStatus, setTempStatus] = useState<string>('all');

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingAd, setEditingAd] = useState<AdSummaryDto | null>(null);
    const [deletingAd, setDeletingAd] = useState<AdSummaryDto | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const { mutateAsync: toggleAdStatus } = usePatchApiAdminAdsIdStatus();
    const { playingAdId, handlePlayToggle } = useAdPlayback();

    // Параметры запроса к бэкенду
    const queryParams: GetApiAdminAdsParams = {
        Page: page,
        PageSize: PAGE_SIZE,
        SearchTerm: search.trim() || undefined,
        SortBy: sortBy || undefined,
        SortOrder: sortOrder || undefined
    };

    const { data, isLoading, isError, refetch } = useGetApiAdminAds(queryParams);

    const responseData = (data as { data?: AdSummaryDtoPaginatedList } | undefined)?.data
        ?? (data as AdSummaryDtoPaginatedList | undefined);

    const rawAdsList = responseData?.items ?? [];
    const totalPages = responseData?.totalPages ?? 1;
    const totalCount = responseData?.totalCount ?? 0;

    // Клиентская фильтрация списка по статусу активности
    const adsList = rawAdsList.filter(ad => {
        if (statusFilter === 'active') return ad.isActive === true;
        if (statusFilter === 'inactive') return ad.isActive === false;
        return true;
    });

    // Хендлеры для массового выбора чекбоксов
    const handleSelectAll = () => {
        if (selectedIds.size === adsList.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(adsList.map(ad => ad.id).filter(Boolean) as string[]));
        }
    };

    const handleToggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleSwitchActive = async (ad: AdSummaryDto) => {
        if (!ad.id) return;
        try {
            await toggleAdStatus({
                id: ad.id,
                data: {
                    adId: ad.id,
                    isActive: !ad.isActive
                } as Parameters<typeof toggleAdStatus>[0]['data']
            });
            refetch();
        } catch (err) {
            console.error(err);
        }
    };

    // Логика кнопок бокового меню фильтров (Offcanvas)
    const handleApplyFilters = () => {
        setStatusFilter(tempStatus);
        setPage(1);
    };

    const handleResetFilters = () => {
        setTempStatus('all');
        setStatusFilter('all');
        setPage(1);
    };

    // Контент фильтров, который BaseTable вставит внутрь Offcanvas-body
    const filterContent = (
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
    );

    return (
        <>
            <BaseTable
                title="Audio Ads & Commercials"
                subtitle={`Targeted promotional audio payloads inside free playback loops (Total items: ${totalCount})`}
                columns={COLUMNS}
                onNewClick={() => setIsCreateOpen(true)}

                // 🚨 ФИКС ПОИСКА: Передаем значение стейта, чтобы текст отображался при вводе
                searchValue={search}
                searchPlaceholder="Search campaigns or brands..."
                onSearchChange={(e) => { setSearch(e.target.value); setPage(1); }}
                onSearchClear={() => { setSearch(''); setPage(1); }}

                // 🚨 ИНТЕГРАЦИЯ СОРТИРОВКИ
                sortOptions={SORT_OPTIONS}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={(field, order) => { setSortBy(field); setSortOrder(order); setPage(1); }}

                // 🚨 ИНТЕГРАЦИЯ БОКОВЫХ ФИЛЬТРОВ (OFFCANVAS)
                filterContent={filterContent}
                onApplyFilters={handleApplyFilters}
                onResetFilters={handleResetFilters}
                activeFiltersCount={statusFilter !== 'all' ? 1 : 0}

                // Чекбоксы (управление строками)
                selectedCount={selectedIds.size}
                isAllSelected={adsList.length > 0 && selectedIds.size === adsList.length}
                onSelectAll={handleSelectAll}
                onDeleteSelected={() => { /* Логика удаления нескольких элементов, если потребуется */ }}

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
            <EditAdModal ad={editingAd} isOpen={!!editingAd} onClose={() => setEditingAd(null)} onSuccess={() => { refetch(); setEditingAd(null); }} />
            <DeleteAdModal ad={deletingAd} isOpen={!!deletingAd} onClose={() => setDeletingAd(null)} onSuccess={() => { refetch(); setDeletingAd(null); }} />
        </>
    );
};