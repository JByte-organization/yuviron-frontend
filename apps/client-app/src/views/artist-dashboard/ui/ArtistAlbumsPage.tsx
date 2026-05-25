'use client';

import React, { useState } from 'react';
import { AlbumCard, type AlbumCardData } from '@/entities/album/ui/AlbumCard';
import { AlbumDetailModal, CreateAlbumModal, DeleteAlbumModal } from '@/features/artist/album/ui/AlbumModals';

// ─── Mock ──────────────────────────────────────────────────
const MOCK_ALBUMS: AlbumCardData[] = [
    { id: 'a1', title: 'ДЛЯ НАСТРОЮ1',    artistName: 'МузикаВітч', tracksCount: 8,  coverUrl: null },
    { id: 'a2', title: 'ДЛЯ НАСТРОЮ2',    artistName: 'МузикаВітч', tracksCount: 10, coverUrl: null },
    { id: 'a3', title: 'ПІДТРИМКА КО...', artistName: 'МузикаВітч', tracksCount: 5,  coverUrl: null },
];

export const ArtistAlbumsPage = () => {
    const [search,          setSearch]          = useState('');
    const [showCreate,      setShowCreate]       = useState(false);
    const [selectedAlbum,   setSelectedAlbum]    = useState<AlbumCardData | null>(null);
    const [deletingAlbum,   setDeletingAlbum]    = useState<AlbumCardData | null>(null);

    const filtered = MOCK_ALBUMS.filter(a =>
        a.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="artist-albums-page">

            {/* ─── Заголовок ────────────────────────── */}
            <div className="artist-tracks-page__header">
                <div>
                    <h1 className="artist-tracks-page__title">Мої альбоми</h1>
                    <p className="artist-tracks-page__subtitle">{MOCK_ALBUMS.length} альбомів</p>
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

                    <button
                        className="artist-tracks-page__upload-btn"
                        onClick={() => setShowCreate(true)}
                    >
                        <i className="bi bi-plus-lg" />
                        Створити альбом
                    </button>
                </div>
            </div>

            {/* ─── Картки альбомів ───────────────────── */}
            {filtered.length === 0 ? (
                <div className="artist-tracks-page__empty">
                    {search ? `Нічого не знайдено для «${search}»` : 'Альбомів ще немає. Створіть перший!'}
                </div>
            ) : (
                <div className="row g-4">
                    {filtered.map(album => (
                        <div key={album.id} className="col-6 col-md-4 col-lg-3 col-xl-2">
                            <div className="artist-albums-page__card-wrap">
                                <AlbumCard
                                    album={album}
                                    onClick={() => setSelectedAlbum(album)}
                                />
                                <button
                                    className="artist-albums-page__delete-btn"
                                    onClick={e => { e.stopPropagation(); setDeletingAlbum(album); }}
                                    title="Видалити альбом"
                                >
                                    <i className="bi bi-trash" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ─── Модалки ───────────────────────────── */}
            <CreateAlbumModal
                isOpen={showCreate}
                onClose={() => setShowCreate(false)}
                onSuccess={() => { setShowCreate(false); /* TODO: refetch */ }}
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
                    onSuccess={() => { setDeletingAlbum(null); /* TODO: refetch */ }}
                />
            )}
        </div>
    );
};