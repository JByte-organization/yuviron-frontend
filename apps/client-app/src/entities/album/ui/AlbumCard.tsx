import React from 'react';
import { MediaCard } from '@/entities/shared/ui/MediaCard';

export interface AlbumCardData {
    id: string;
    title: string;
    artistName: string;
    tracksCount?: number;
    coverUrl?: string | null;
}

interface AlbumCardProps {
    album: AlbumCardData;
    onClick?: (id: string) => void;
}

export const AlbumCard = ({ album, onClick }: AlbumCardProps) => {
    const subtitle = album.tracksCount !== undefined
        ? `by ${album.artistName} • ${album.tracksCount} tracks`
        : `by ${album.artistName}`;

    return (
        <MediaCard
            title={album.title}
            subtitle={subtitle}
            coverUrl={album.coverUrl}
            coverSeed={`album-${album.id}`}
            onClick={() => onClick?.(album.id)}
        />
    );
};