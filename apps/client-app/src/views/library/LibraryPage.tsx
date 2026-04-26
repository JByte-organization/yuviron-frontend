'use client';

import React from 'react';
import { TopTracksSection } from '@/views/home/ui/sections/TopTracksSection';
import { FavoriteArtistsSection } from '@/views/home/ui/sections/FavoriteArtistsSection';
import { LibraryPlaylistsSection } from './ui/sections/LibraryPlaylistsSection';

/**
 * Сторінка: Моя медіатека
 *
 * Перевикористовує секції з головної сторінки —
 * тільки хуки будуть інші (useGetApiLibrary* замість useGetApiHome*)
 */
export const LibraryPage = () => {
    return (
        <div className="library-page">
            <h1 className="library-page__title">Моя медіатека</h1>

            {/* Улюблені треки — той самий компонент що на головній */}
            <TopTracksSection
                sectionTitle="Улюблені треки"
                showAllHref="/favorites"
                // TODO: замінити на useGetApiUserFavoriteTracks()
            />

            {/* Плейлісти */}
            <LibraryPlaylistsSection />

            {/* Улюблені виконавці — той самий компонент що на головній */}
            <FavoriteArtistsSection
                sectionTitle="Твої улюблені виконавці"
                // TODO: замінити на useGetApiUserFavoriteArtists()
            />
        </div>
    );
};