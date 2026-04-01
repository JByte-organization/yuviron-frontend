'use client';

import React, { useState } from 'react';
import { useGetApiAdminTracks } from '@repo/api';
import { BaseTable } from '@/shared/ui/Table/BaseTable';
import { TrackRow } from '@/entities/track/ui/TrackRow';
import { trackTableColumns } from '@/entities/track/model/columns';
import { CreateTrackModal } from '@/features/track/create/ui/CreateTrackModal';

export const TracksPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data, isLoading, refetch } = useGetApiAdminTracks();

    const response = data as any;
    const tracks = response?.data?.items || [];

    return (
        <>
            <BaseTable
                title="Tracks"
                subtitle="Catalog of all musical tracks and audio assets"
                columns={trackTableColumns}
                onNewClick={() => setIsModalOpen(true)}
                searchPlaceholder="Search tracks, artists or genres..."
            >
                {isLoading ? (
                    <tr><td colSpan={9} className="text-center py-5">Loading tracks...</td></tr>
                ) : tracks.length === 0 ? (
                    <tr><td colSpan={9} className="text-center py-5">No tracks found.</td></tr>
                ) : tracks.map((track: any) => (
                    <TrackRow key={track.id} track={track} />
                ))}
            </BaseTable>

            <CreateTrackModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={refetch}
            />
        </>
    );
};