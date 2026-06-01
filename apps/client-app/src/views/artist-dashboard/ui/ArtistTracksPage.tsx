'use client';

import React, { useState } from 'react';
import { TrackRow, type TrackRowData } from '@/entities/track/ui/TrackRow';
import { UploadTrackModal } from '@/features/artist/track/ui/UploadTrackModal';
import { EditTrackModal, DeleteTrackModal } from '@/features/artist/track/ui/EditDeleteArtistTrackModals';

// ─── Mock ──────────────────────────────────────────────────
// TODO: замінити на useGetApiArtistDashboardTracks()
const MOCK_TRACKS: TrackRowData[] = [
    { id: 't1', index: 1, title: 'THE CONTORTIONIST', artistNames: ['МузикаВітч'], artistId: 'a1', albumId: 'al1', albumTitle: 'ДЛЯ НАСТРОЮ1', addedAt: '2025-03-01T00:00:00Z', durationMs: 210000, coverUrl: null },
    { id: 't2', index: 2, title: 'Глубоко',           artistNames: ['МузикаВітч'], artistId: 'a1', albumId: 'al1', albumTitle: 'ДЛЯ НАСТРОЮ1', addedAt: '2025-03-05T00:00:00Z', durationMs: 195000, coverUrl: null },
    { id: 't3', index: 3, title: 'Superman',          artistNames: ['МузикаВітч'], artistId: 'a1', albumId: 'al2', albumTitle: 'ДЛЯ НАСТРОЮ2', addedAt: '2025-04-10T00:00:00Z', durationMs: 224000, coverUrl: null },
    { id: 't4', index: 4, title: 'Sweater Weather',   artistNames: ['МузикаВітч'], artistId: 'a1', albumId: 'al2', albumTitle: 'ДЛЯ НАСТРОЮ2', addedAt: '2025-04-15T00:00:00Z', durationMs: 240000, coverUrl: null },
    { id: 't5', index: 5, title: 'Cry Me A River',    artistNames: ['МузикаВітч'], artistId: 'a1', albumId: 'al3', albumTitle: 'ПІДТРИМКА КО...', addedAt: '2025-05-01T00:00:00Z', durationMs: 188000, coverUrl: null },
];

interface TrackToEdit {
    id: string;
    title: string;
    albumTitle?: string | null;
}

export const ArtistTracksPage = () => {
    const [search,       setSearch]       = useState('');
    const [showUpload,   setShowUpload]   = useState(false);
    const [editingTrack, setEditingTrack] = useState<TrackToEdit | null>(null);
    const [deletingTrack,setDeletingTrack]= useState<TrackToEdit | null>(null);
    const [currentTrack, setCurrentTrack] = useState<string | null>(null);

    const filtered = MOCK_TRACKS.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.artistNames.join(' ').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="artist-tracks-page">

            {/* ─── Заголовок ────────────────────────── */}
            <div className="artist-tracks-page__header">
                <div>
                    <h1 className="artist-tracks-page__title">Мої треки</h1>
                    <p className="artist-tracks-page__subtitle">{MOCK_TRACKS.length} треків</p>
                </div>

                <div className="artist-tracks-page__controls">
                    {/* Пошук */}
                    <div className="artist-tracks-page__search">
                        <i className="bi bi-search artist-tracks-page__search-icon" />
                        <input
                            type="text"
                            className="artist-tracks-page__search-input"
                            placeholder="Пошук треків..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        {search && (
                            <button
                                className="artist-tracks-page__search-clear"
                                onClick={() => setSearch('')}
                            >
                                <i className="bi bi-x" />
                            </button>
                        )}
                    </div>

                    {/* Кнопка завантажити */}
                    <button
                        className="artist-tracks-page__upload-btn"
                        onClick={() => setShowUpload(true)}
                    >
                        <i className="bi bi-cloud-upload" />
                        Завантажити трек
                    </button>
                </div>
            </div>

            {/* ─── Заголовки колонок ─────────────────── */}
            <div className="artist-tracks-page__columns">
                <div className="artist-tracks-page__col-index">#</div>
                <div className="artist-tracks-page__col-title">Назва</div>
                <div className="artist-tracks-page__col-album d-none d-md-block">Альбом</div>
                <div className="artist-tracks-page__col-date d-none d-lg-block">Дата додавання</div>
                <div className="artist-tracks-page__col-duration">
                    <i className="bi bi-clock" />
                </div>
            </div>

            <hr className="artist-tracks-page__divider" />

            {/* ─── Список треків ─────────────────────── */}
            {filtered.length === 0 ? (
                <div className="artist-tracks-page__empty">
                    {search ? `Нічого не знайдено для «${search}»` : 'Треків ще немає. Завантажте перший трек!'}
                </div>
            ) : (
                filtered.map(track => (
                    <div key={track.id} className="artist-tracks-page__row-wrap">
                        <TrackRow
                            track={track}
                            isPlaying={currentTrack === track.id}
                            onClick={id => setCurrentTrack(id === currentTrack ? null : id)}
                        />
                        {/* Кнопки редагування/видалення */}
                        <div className="artist-tracks-page__row-actions">
                            <button
                                className="artist-tracks-page__row-btn"
                                onClick={() => setEditingTrack({ id: track.id, title: track.title, albumTitle: track.albumTitle })}
                                title="Редагувати"
                            >
                                <i className="bi bi-pencil" />
                            </button>
                            <button
                                className="artist-tracks-page__row-btn artist-tracks-page__row-btn--danger"
                                onClick={() => setDeletingTrack({ id: track.id, title: track.title, albumTitle: track.albumTitle })}
                                title="Видалити"
                            >
                                <i className="bi bi-trash" />
                            </button>
                        </div>
                    </div>
                ))
            )}

            {/* ─── Модалки ───────────────────────────── */}
            <UploadTrackModal
                isOpen={showUpload}
                onClose={() => setShowUpload(false)}
                onSuccess={() => { setShowUpload(false); /* TODO: refetch */ }}
            />

            {editingTrack && (
                <EditTrackModal
                    isOpen={!!editingTrack}
                    trackId={editingTrack.id}
                    trackTitle={editingTrack.title}
                    onClose={() => setEditingTrack(null)}
                    onSuccess={() => { setEditingTrack(null); /* TODO: refetch */ }}
                />
            )}

            {deletingTrack && (
                <DeleteTrackModal
                    isOpen={!!deletingTrack}
                    trackId={deletingTrack.id}
                    trackTitle={deletingTrack.title}
                    onClose={() => setDeletingTrack(null)}
                    onSuccess={() => { setDeletingTrack(null); /* TODO: refetch */ }}
                />
            )}
        </div>
    );
};