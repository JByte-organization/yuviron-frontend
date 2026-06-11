'use client';

import React, { useEffect, useState } from 'react';
import {
    getGetApiStudioArtistAlbumsQueryKey,
    useGetApiStudioArtistAlbums,
} from '@repo/api/artist.ts';
import type { StudioAlbumListItemFlex } from '@/entities/artist/model/studioListDtoFlex';
import { useQueryClient } from '@tanstack/react-query';
import { AlbumCard, type AlbumCardData } from '@/entities/album/ui/AlbumCard';
import { AlbumDetailModal, CreateAlbumModal, DeleteAlbumModal } from '@/features/artist/album/ui/AlbumModals';
import { useCurrentArtist } from '@/entities/artist/model/currentArtist';
import { unwrapItems } from '@/shared/lib/unwrapApi';

export const ArtistAlbumsPage = () => {
    const { artistId, canManage } = useCurrentArtist();
    const queryClient = useQueryClient();

    const [search,          setSearch]          = useState('');
    const [debounced,       setDebounced]       = useState('');
    const [showCreate,      setShowCreate]       = useState(false);
    const [selectedAlbum,   setSelectedAlbum]    = useState<AlbumCardData | null>(null);
    const [deletingAlbum,   setDeletingAlbum]    = useState<AlbumCardData | null>(null);

    useEffect(() => {
        const id = setTimeout(() => setDebounced(search.trim()), 300);
        return () => clearTimeout(id);
    }, [search]);

    const params = {
        ArtistId: artistId ?? undefined,
        SearchTerm: debounced || undefined,
        Page: 1,
        PageSize: 100,
    };
    const { data: albumsRaw, isLoading } = useGetApiStudioArtistAlbums(params, {
        query: { enabled: !!artistId, queryKey: getGetApiStudioArtistAlbumsQueryKey(params) },
    });

    const albums: AlbumCardData[] = unwrapItems<StudioAlbumListItemFlex>(albumsRaw).map(a => ({
        id: a.id ?? '',
        title: a.title ?? 'Без назви',
        artistName: '',
        tracksCount: a.tracksCount,
        coverUrl: a.coverUrl,
    }));

    const refetchAlbums = () =>
        queryClient.invalidateQueries({ queryKey: ['/api/studio-artist/albums'] });

    return (
        <div className="artist-albums-page">

            {/* ─── Заголовок ────────────────────────── */}
            <div className="artist-tracks-page__header">
                <div>
                    <h1 className="artist-tracks-page__title">Мої альбоми</h1>
                    <p className="artist-tracks-page__subtitle">{albums.length} альбомів</p>
                </div>

                <div className="artist-tracks-page__controls">
                    <div className="artist-tracks-page__search">
                        <i className="bi bi-search artist-tracks-page__search-icon" />
                        <input
                            type="text"
                            className="artist-tracks-page__search-input"
                            placeholder="Пошук альбомів..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        {search && (
                            <button className="artist-tracks-page__search-clear" onClick={() => setSearch('')}>
                                <i className="bi bi-x" />
                            </button>
                        )}
                    </div>

                    {canManage && (
                        <button
                            className="artist-tracks-page__upload-btn"
                            onClick={() => setShowCreate(true)}
                        >
                            <i className="bi bi-plus-lg" />
                            Створити альбом
                        </button>
                    )}
                </div>
            </div>

            {/* ─── Картки альбомів ───────────────────── */}
            {albums.length === 0 ? (
                <div className="artist-tracks-page__empty">
                    {isLoading
                        ? 'Завантаження…'
                        : search
                            ? `Нічого не знайдено для «${search}»`
                            : 'Альбомів ще немає. Створіть перший!'}
                </div>
            ) : (
                <div className="row g-4">
                    {albums.map(album => (
                        <div key={album.id} className="col-6 col-md-4 col-lg-3 col-xl-2">
                            <div className="artist-albums-page__card-wrap">
                                <AlbumCard
                                    album={album}
                                    onClick={() => setSelectedAlbum(album)}
                                />
                                {canManage && (
                                    <button
                                        className="artist-albums-page__delete-btn"
                                        onClick={e => { e.stopPropagation(); setDeletingAlbum(album); }}
                                        title="Видалити альбом"
                                    >
                                        <i className="bi bi-trash" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ─── Модалки ───────────────────────────── */}
            <CreateAlbumModal
                isOpen={showCreate}
                onClose={() => setShowCreate(false)}
                onSuccess={() => { setShowCreate(false); refetchAlbums(); }}
            />

            {selectedAlbum && (
                <AlbumDetailModal
                    isOpen={!!selectedAlbum}
                    album={selectedAlbum}
                    onClose={() => setSelectedAlbum(null)}
                />
            )}

            {deletingAlbum && (
                <DeleteAlbumModal
                    isOpen={!!deletingAlbum}
                    album={deletingAlbum}
                    onClose={() => setDeletingAlbum(null)}
                    onSuccess={() => { setDeletingAlbum(null); refetchAlbums(); }}
                />
            )}
        </div>
    );
};