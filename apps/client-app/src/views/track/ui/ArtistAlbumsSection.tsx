'use client';

import React, { useMemo } from 'react';
import { useGetApiArtistsIdAlbums, type ArtistAlbumDto } from '@repo/api/client';
import { NewReleasesSection } from '@/views/home/ui/sections/NewReleasesSection';
import type { AlbumCardData } from '@/entities/album/ui/AlbumCard';

interface ArtistAlbumsSectionProps {
    artistId: string;
    artistName: string;
}

export const ArtistAlbumsSection = ({ artistId, artistName }: ArtistAlbumsSectionProps) => {
    // Отримуємо першу сторінку альбомів виконавця
    const { data: rawAlbums, isLoading } = useGetApiArtistsIdAlbums(artistId, {
        page: 1,
        pageSize: 10
    });

    const mappedAlbums = useMemo<AlbumCardData[]>(() => {
        const unwrapped = (rawAlbums as any)?.data ?? rawAlbums;

        // Перевіряємо структуру пагінації ArtistAlbumDtoPaginatedList зі Сваггера
        let list: ArtistAlbumDto[] = [];
        if (unwrapped && typeof unwrapped === 'object') {
            if (Array.isArray(unwrapped.items)) list = unwrapped.items;
            else if (Array.isArray(unwrapped)) list = unwrapped;
        }

        return list.map((album) => ({
            id:          album.id ?? '',
            title:       album.title ?? 'Без назви',
            artistName:  artistName,
            coverUrl:    album.coverUrl,
            tracksCount: undefined, // Модель ArtistAlbumDto не повертає лічильник треків, тому лишаємо undefined
        }));
    }, [rawAlbums, artistName]);

    return (
        <NewReleasesSection
            sectionTitle={`${artistName}: інші альбоми`}
            albums={mappedAlbums}
            isLoading={isLoading}
            showAllHref={`/artists/${artistId}/albums`}
        />
    );
};