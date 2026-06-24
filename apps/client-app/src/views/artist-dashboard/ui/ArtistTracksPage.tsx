'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
    getGetApiStudioArtistTracksQueryKey,
    useGetApiStudioArtistTracks,
    useGetApiStudioArtistAlbums,
    getGetApiStudioArtistAlbumsQueryKey,
    getApiStudioArtistAlbumsIdTracks,
    getGetApiStudioArtistAlbumsIdTracksQueryKey,
    type StudioAlbumListItemDto,
    type StudioAlbumTrackDto,
} from '@repo/api/artist.ts';
import type { StudioTrackListItemFlex } from '@/entities/artist/model/studioListDtoFlex';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { TrackRow, type TrackRowData } from '@/entities/track/ui/TrackRow';
import { UploadTrackModal } from '@/features/artist/track/ui/UploadTrackModal';
import { EditTrackModal, DeleteTrackModal } from '@/features/artist/track/ui/EditDeleteArtistTrackModals';
import { TrackAnalyticsModal } from '@/features/artist/track/ui/TrackAnalyticsModal';
import { useCurrentArtist } from '@/entities/artist/model/currentArtist';
import { useArtistPermissions } from '@/entities/artist/model/useArtistPermissions';
import { unwrapItems, unwrapList } from '@/shared/lib/unwrapApi';

interface TrackToEdit {
    id: string;
    title: string;
    albumTitle?: string | null;
}

export const ArtistTracksPage = () => {
    const { artistId } = useCurrentArtist();
    const { can, lockTitle } = useArtistPermissions();
    const canTracks = can('tracks');
    const queryClient = useQueryClient();

    const [search,       setSearch]       = useState('');
    const [debounced,    setDebounced]    = useState('');
    const [showUpload,   setShowUpload]   = useState(false);
    const [editingTrack, setEditingTrack] = useState<TrackToEdit | null>(null);
    const [deletingTrack,setDeletingTrack]= useState<TrackToEdit | null>(null);
    const [analyticsTrack, setAnalyticsTrack] = useState<TrackToEdit | null>(null);

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
    const { data: tracksRaw, isLoading } = useGetApiStudioArtistTracks(params, {
        query: { enabled: !!artistId, queryKey: getGetApiStudioArtistTracksQueryKey(params) },
    });

    // ─── Воркераунд: привʼязка трек → альбом ──────────────────────────────
    // Список треків (StudioTrackListItemDto) НЕ повертає albumId/albumTitle —
    // ці поля є лише в StudioTrackDetailsDto. Тому будуємо мапу trackId → альбом
    // з альбомів артиста та їхніх треків (/albums/{id}/tracks). Прибрати, щойно
    // бек додасть albumId/albumTitle у StudioTrackListItemDto (тоді спрацює
    // прямий t.albumId/t.albumTitle нижче).
    const albumsParams = { ArtistId: artistId ?? undefined, Page: 1, PageSize: 100 };
    const { data: albumsRaw } = useGetApiStudioArtistAlbums(albumsParams, {
        query: { enabled: !!artistId, queryKey: getGetApiStudioArtistAlbumsQueryKey(albumsParams) },
    });
    const albumList = useMemo(
        () => unwrapItems<StudioAlbumListItemDto>(albumsRaw),
        [albumsRaw],
    );

    // По одному запиту на альбом (N+1, прийнятно для воркераунда). Кешуємо на хвилину.
    const albumTrackQueries = useQueries({
        queries: albumList.map((album) => ({
            queryKey: getGetApiStudioArtistAlbumsIdTracksQueryKey(album.id ?? ''),
            queryFn: () => getApiStudioArtistAlbumsIdTracks(album.id ?? ''),
            enabled: !!album.id,
            staleTime: 60_000,
        })),
    });

    // Підпис результатів — стабільний рядок, що змінюється лише коли підʼїхали
    // нові дані (інакше useMemo нижче перебудовувався б щорендера через новий масив).
    const albumTracksSig = albumTrackQueries
        .map((q) => q.dataUpdatedAt ?? 0)
        .join(',');

    const tracks: TrackRowData[] = useMemo(() => {
        // trackId → { albumId, albumTitle }
        const albumByTrackId = new Map<string, { albumId: string; albumTitle: string }>();
        albumTrackQueries.forEach((q, i) => {
            const album = albumList[i];
            if (!album?.id) return;
            unwrapList<StudioAlbumTrackDto>(q.data).forEach((tr) => {
                if (tr.id) albumByTrackId.set(tr.id, { albumId: album.id!, albumTitle: album.title ?? '' });
            });
        });

        return unwrapItems<StudioTrackListItemFlex>(tracksRaw).map((t, i) => {
            const fromAlbum = t.id ? albumByTrackId.get(t.id) : undefined;
            return {
                id:          t.id ?? '',
                index:       t.albumPosition ?? i + 1,
                title:       t.title ?? 'Без назви',
                artistNames: t.artistNames ?? [],
                artistId:    artistId ?? '',
                // Прямі поля з беку мають пріоритет; мапа — фолбек, поки їх немає.
                albumId:     t.albumId ?? fromAlbum?.albumId ?? '',
                albumTitle:  t.albumTitle ?? fromAlbum?.albumTitle ?? null,
                addedAt:     t.createdAt ?? '',
                durationMs:  t.durationMs ?? 0,
                coverUrl:    t.coverUrl,
                isSaved:     (t as any).isSaved ?? false,
            };
        });
        // albumTrackQueries читаємо через albumTracksSig, щоб не перебудовуватись
        // щорендера на новому масиві результатів useQueries.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tracksRaw, artistId, albumList, albumTracksSig]);

    const refetchTracks = () =>
        queryClient.invalidateQueries({ queryKey: ['/api/studio-artist/tracks'] });

    return (
        <div className="artist-tracks-page">
            <div className="artist-tracks-page__header">
                <div>
                    <h1 className="artist-tracks-page__title">Мої треки</h1>
                    <p className="artist-tracks-page__subtitle">{tracks.length} треків</p>
                </div>

                <div className="artist-tracks-page__controls">
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

                    <button
                        className="artist-tracks-page__upload-btn"
                        onClick={() => setShowUpload(true)}
                        disabled={!canTracks}
                        title={!canTracks ? lockTitle : undefined}
                    >
                        <i className={`bi ${canTracks ? 'bi-cloud-upload' : 'bi-lock-fill'}`} />
                        Завантажити трек
                    </button>
                </div>
            </div>

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

            {tracks.length === 0 ? (
                <div className="artist-tracks-page__empty">
                    {isLoading
                        ? 'Завантаження…'
                        : search
                            ? `Нічого не знайдено для «${search}»`
                            : 'Треків ще немає. Завантажте перший трек!'}
                </div>
            ) : (
                <div className="d-flex flex-column gap-1">
                    {tracks.map(track => (
                        <div key={track.id} className="artist-tracks-page__row-wrap">
                            <TrackRow
                                key={`${track.id}-${track.isSaved}`}
                                track={track}
                                allTracks={tracks}
                                sourceType="ArtistProfile"
                            />

                            <div className="artist-tracks-page__row-actions">
                                <button
                                    className="artist-tracks-page__row-btn"
                                    onClick={() => setAnalyticsTrack({ id: track.id, title: track.title, albumTitle: track.albumTitle })}
                                    title="Аналітика"
                                >
                                    <i className="bi bi-graph-up" />
                                </button>
                                <button
                                    className="artist-tracks-page__row-btn"
                                    onClick={() => setEditingTrack({ id: track.id, title: track.title, albumTitle: track.albumTitle })}
                                    disabled={!canTracks}
                                    title={!canTracks ? lockTitle : 'Редагувати'}
                                >
                                    <i className={`bi ${canTracks ? 'bi-pencil' : 'bi-lock-fill'}`} />
                                </button>
                                <button
                                    className="artist-tracks-page__row-btn artist-tracks-page__row-btn--danger"
                                    onClick={() => setDeletingTrack({ id: track.id, title: track.title, albumTitle: track.albumTitle })}
                                    disabled={!canTracks}
                                    title={!canTracks ? lockTitle : 'Видалити'}
                                >
                                    <i className={`bi ${canTracks ? 'bi-trash' : 'bi-lock-fill'}`} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Модалки */}
            <UploadTrackModal isOpen={showUpload} onClose={() => setShowUpload(false)} onSuccess={() => { setShowUpload(false); refetchTracks(); }} />
            {editingTrack && <EditTrackModal isOpen={!!editingTrack} trackId={editingTrack.id} trackTitle={editingTrack.title} onClose={() => setEditingTrack(null)} onSuccess={() => { setEditingTrack(null); refetchTracks(); }} />}
            {analyticsTrack && <TrackAnalyticsModal isOpen={!!analyticsTrack} trackId={analyticsTrack.id} trackTitle={analyticsTrack.title} onClose={() => setAnalyticsTrack(null)} />}
            {deletingTrack && <DeleteTrackModal isOpen={!!deletingTrack} trackId={deletingTrack.id} trackTitle={deletingTrack.title} onClose={() => setDeletingTrack(null)} onSuccess={() => { setDeletingTrack(null); refetchTracks(); }} />}
        </div>
    );
};