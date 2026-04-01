'use client';

import React, { useState } from 'react';
import { useGetApiAdminArtists } from '@repo/api';
import { BaseTable } from '@/shared/ui/Table/BaseTable';
import { ArtistRow } from '@/entities/artist/ui/ArtistRow';
import { artistTableColumns } from '@/entities/artist/model/columns';
import { CreateArtistModal } from '@/features/artist/create/ui/CreateArtistModal';

export const ArtistsPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);


    const { data, isLoading, isError, refetch } = useGetApiAdminArtists({
        // @ts-ignore - если Orval требует PascalCase, а ты хочешь уверенности
        Page: currentPage,
        PageSize: 20
    } as any);

    /**
     * Обработка ответа PaginatedList.
     */
    const responseData = data as any;
    const artists = responseData?.Items || responseData?.items || [];
    const totalPages = responseData?.TotalPages || responseData?.totalPages || 1;
    const hasNext = responseData?.HasNextPage || responseData?.hasNextPage || false;
    const hasPrev = responseData?.HasPreviousPage || responseData?.hasPreviousPage || false;
    const totalCount = responseData?.TotalCount || responseData?.totalCount || 0;

    return (
        <>
            <BaseTable
                title="Artists"
                subtitle={`Manage creators (Total: ${totalCount})`}
                columns={artistTableColumns}
                onNewClick={() => setIsModalOpen(true)}
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
                        <ArtistRow key={artist.id || artist.Id} artist={artist} />
                    ))
                )}
            </BaseTable>

            <CreateArtistModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={refetch}
            />
        </>
    );
};