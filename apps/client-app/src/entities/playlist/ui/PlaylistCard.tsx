import React from 'react';
import { MediaCard } from '@/entities/shared/ui/MediaCard';

export interface PlaylistCardData {
    id: string;
    name: string;
    tracksCount?: number;
    authorName?: string;
    coverUrl?: string | null;
}

interface PlaylistCardProps {
    playlist: PlaylistCardData;
    onClick?: (id: string) => void;
}

/**
 * Картка плейліста.
 * Розмір контролюється Bootstrap колонками в батьківському компоненті.
 *
 * Підключення даних:
 * coverUrl, name, tracksCount — з useGetApiUserPlaylists()
 */
export const PlaylistCard = ({ playlist, onClick }: PlaylistCardProps) => {
    const subtitle = playlist.authorName
        ? `by ${playlist.authorName}`
        : playlist.tracksCount !== undefined
            ? `${playlist.tracksCount} треків`
            : undefined;

    return (
        <MediaCard
            title={playlist.name}
            subtitle={subtitle}
            coverUrl={playlist.coverUrl}
            coverSeed={`playlist-${playlist.id}`}
            onClick={() => onClick?.(playlist.id)}
        />
    );
};