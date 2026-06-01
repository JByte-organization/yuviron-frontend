'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
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
    const router = useRouter();

    const subtitle = album.tracksCount !== undefined
        ? `by ${album.artistName} • ${album.tracksCount} tracks`
        : `by ${album.artistName}`;

    const handleClick = () => {
        // Якщо передали кастомний обробник (наприклад, для трека чи аналітики) — викликаємо його
        if (onClick) {
            onClick(album.id);
        } else {
            // Інакше — робимо стандартний перехід на сторінку альбому за нашою FSD структурою
            router.push(`/albums/${album.id}`);
        }
    };

    return (
        <MediaCard
            title={album.title}
            subtitle={subtitle}
            coverUrl={album.coverUrl}
            coverSeed={`album-${album.id}`}
            onClick={handleClick}
        />
    );
};