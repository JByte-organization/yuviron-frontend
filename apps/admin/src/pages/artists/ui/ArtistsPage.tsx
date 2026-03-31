'use client';

import React, { useState } from 'react';
import { useGetApiAdminArtists } from '@repo/api';
import { BaseTable } from '@/shared/ui/Table/BaseTable';
import { ArtistRow } from '@/entities/artist/ui/ArtistRow';
import { artistTableColumns } from '@/entities/artist/model/columns';
import { CreateArtistModal } from '@/features/artist/create/ui/CreateArtistModal';

export const ArtistsPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data, isLoading, refetch } = useGetApiAdminArtists();

    const response = data as any;
    const artists = response?.data?.items || [];

    return (
        <>
            <BaseTable
                title="Artists"
                subtitle="Manage musical creators and their profiles"
                columns={artistTableColumns}
                onNewClick={() => setIsModalOpen(true)}
            >
                {isLoading ? (
                    <tr><td colSpan={7} className="text-center py-5">Loading artists...</td></tr>
                ) : artists.map((artist: any) => (
                    <ArtistRow key={artist.id} artist={artist} />
                ))}
            </BaseTable>

            <CreateArtistModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={refetch}
            />
        </>
    );
};