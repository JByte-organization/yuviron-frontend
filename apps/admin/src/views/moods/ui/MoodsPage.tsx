'use client';

import React, { useState } from 'react';
import { useGetApiAdminMoods, type MoodDto } from '@repo/api/admin.ts';
import { BaseTable } from '@/shared/ui/Table/BaseTable';
import { MoodRow } from '@/entities/mood/ui/MoodRow';
import { moodTableColumns } from '@/entities/mood/model/columns';
import { CreateMoodModal } from '@/features/mood/create/ui/CreateMoodModal';
import { EditMoodModal } from '@/features/mood/edit/ui/EditMoodModal';
import { DeleteMoodModal } from '@/features/mood/delete/ui/DeleteMoodModal';

export const MoodsPage = () => {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingMood, setEditingMood] = useState<MoodDto | null>(null);
    const [deletingMood, setDeletingMood] = useState<MoodDto | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);

    const { data, isLoading, isError, refetch } = useGetApiAdminMoods({
        Page: currentPage,
        PageSize: 20,
    });

    const responseData = (data as any)?.data || (data as any);
    const moods: MoodDto[]  = responseData?.items ?? [];
    const totalPages        = responseData?.totalPages ?? 1;
    const hasNext           = responseData?.hasNextPage ?? false;
    const hasPrev           = responseData?.hasPreviousPage ?? false;
    const totalCount        = responseData?.totalCount ?? 0;

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
                title="Moods"
                subtitle={`Manage music moods (Total: ${totalCount})`}
                columns={moodTableColumns}
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
                        <td colSpan={moodTableColumns.length} className="text-center py-5">
                            <div className="spinner-border text-primary" />
                        </td>
                    </tr>
                ) : isError ? (
                    <tr>
                        <td colSpan={moodTableColumns.length} className="text-center py-5 text-danger">
                            Error loading moods.
                        </td>
                    </tr>
                ) : moods.length === 0 ? (
                    <tr>
                        <td colSpan={moodTableColumns.length} className="text-center py-5 text-secondary">
                            No moods found.
                        </td>
                    </tr>
                ) : (
                    moods.map((mood) => (
                        <MoodRow
                            key={mood.id}
                            mood={mood}
                            isSelected={selectedIds.has(mood.id!)}
                            onSelect={() => handleToggleSelect(mood.id!)}
                            onEdit={setEditingMood}
                            onDelete={setDeletingMood}
                        />
                    ))
                )}
            </BaseTable>

            <CreateMoodModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={refetch}
            />

            <EditMoodModal
                mood={editingMood}
                isOpen={!!editingMood}
                onClose={() => setEditingMood(null)}
                onSuccess={() => { refetch(); setEditingMood(null); }}
            />

            <DeleteMoodModal
                mood={deletingMood}
                isOpen={!!deletingMood}
                onClose={() => setDeletingMood(null)}
                onSuccess={() => { refetch(); setDeletingMood(null); }}
            />
        </>
    );
};