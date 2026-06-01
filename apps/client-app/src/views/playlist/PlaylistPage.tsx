'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    useGetApiPlaylistsId,
    useGetApiPlaylistsIdTracks,
    useGetApiAuthMe,
    usePutApiMePlaylistsId,
    useDeleteApiMePlaylistsId,
    type PlaylistDetailsClientDto,
    type PlaylistTrackItemClientDto,
    type CurrentUserDto,
    type UpdatePlaylistRequest,
} from '@repo/api/client.ts';
import { TrackRow, type TrackRowData } from '@/entities/track/ui/TrackRow';
import { AddToPlaylistModal } from '@/features/playlist/add/ui/AddToPlaylistModal';
import { EditPlaylistModal, type PlaylistToEdit } from '@/features/playlist/edit/ui/EditPlaylistModal';
import { DeletePlaylistModal } from '@/features/playlist/detete/ui/DeletePlaylistModal';
import { CreatePlaylistModal } from '@/features/playlist/create/ui/CreatePlaylistModal';
import { PlaylistPageHeader } from './ui/PlaylistPageHeader';
import { PlaylistRecommendations } from './ui/PlaylistRecommendations';
import {PlaylistVisibility} from "@repo/api/generated/client/models";


interface PlaylistPageProps {
    playlistId: string;
}

// ─── Маппінг даних з API у формат TrackRow ────────────────────────────────────
// PlaylistTrackItemClientDto → TrackRowData
// Причина: TrackRow — загальний компонент, він не знає про структуру плейліста.
// Ми перетворюємо дані тут, щоб TrackRow залишився незалежним.
const mapTrack = (t: PlaylistTrackItemClientDto, index: number): TrackRowData => ({
    id:          t.trackId   ?? '',
    index:       index + 1,
    title:       t.title     ?? '',
    artistNames: t.artists?.map(a => a.name ?? '') ?? [],
    artistId:    t.artists?.[0]?.id ?? undefined,
    albumId:     t.albumId   ?? undefined,
    albumTitle:  null,   // PlaylistTrackItemClientDto не містить albumTitle
    addedAt:     t.addedAt   ?? null,
    durationMs:  t.durationMs ?? null,
    coverUrl:    t.coverUrl  ?? null,
});

// ─── Компонент ────────────────────────────────────────────────────────────────
export const PlaylistPage = ({ playlistId }: PlaylistPageProps) => {
    const router = useRouter();

    // ── Запити даних ──────────────────────────────────────────────────────────
    const {
        data: playlistRaw,
        isLoading: playlistLoading,
        refetch: refetchPlaylist,
    } = useGetApiPlaylistsId(playlistId);

    const {
        data: tracksRaw,
        isLoading: tracksLoading,
    } = useGetApiPlaylistsIdTracks(playlistId, { Page: 1, PageSize: 50 });

    // GET /api/auth/me — потрібен для визначення чи є поточний юзер власником
    const { data: meRaw } = useGetApiAuthMe();

    // Наш mutator повертає дані напряму без обгортки { data, status }
    const playlist  = playlistRaw  as unknown as PlaylistDetailsClientDto;
    const tracksData = tracksRaw   as unknown as { items?: PlaylistTrackItemClientDto[] };
    const me        = meRaw        as unknown as CurrentUserDto;

    const tracks: TrackRowData[] = (tracksData?.items ?? []).map(mapTrack);

    // isOwner: порівнюємо id поточного юзера з creatorId плейліста
    const isOwner = !!me?.id && !!playlist?.creatorId && me.id === playlist.creatorId;

    // ── Мутації ───────────────────────────────────────────────────────────────
    const { mutateAsync: updatePlaylist } = usePutApiMePlaylistsId();
    const { mutateAsync: deletePlaylist } = useDeleteApiMePlaylistsId();

    // ── Стан модалок ──────────────────────────────────────────────────────────
    const [addToPlaylistTrackId, setAddToPlaylistTrackId] = useState<string | null>(null);
    const [addToPlaylistTitle,   setAddToPlaylistTitle]   = useState('');
    const [showEdit,   setShowEdit]   = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [showCreate, setShowCreate] = useState(false);

    // ── Хендлери ──────────────────────────────────────────────────────────────
    const handleAddToPlaylist = (trackId: string, title: string) => {
        setAddToPlaylistTrackId(trackId);
        setAddToPlaylistTitle(title);
    };

    // Редагування: отримуємо дані з форми → відправляємо на PUT /api/me/playlists/:id
    const handleEditSuccess = async (values: {
        name: string;
        description?: string;
        coverUrl?: string | null;
        isPrivate: boolean;
    }) => {
        const body: UpdatePlaylistRequest = {
            title:       values.name,
            coverFileId: values.coverUrl ?? null,
            // конвертуємо boolean → PlaylistVisibility enum
            visibility:  values.isPrivate ? PlaylistVisibility.Private : PlaylistVisibility.Public,
        };
        await updatePlaylist({ id: playlistId, data: body });
        refetchPlaylist();
        setShowEdit(false);
    };

    // Видалення: DELETE /api/me/playlists/:id → редірект на /library
    const handleDeleteSuccess = async () => {
        await deletePlaylist({ id: playlistId });
        router.push('/library');
    };

    // ── Стани завантаження ────────────────────────────────────────────────────
    if (playlistLoading || tracksLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">Завантаження...</span>
                </div>
            </div>
        );
    }

    if (!playlist) {
        return (
            <div className="text-center text-secondary mt-5">
                Плейліст не знайдено
            </div>
        );
    }

    // ── Перетворення для дочірніх компонентів ─────────────────────────────────
    // PlaylistPageHeader очікує свій формат об'єкта — адаптуємо тут
    const playlistForHeader = {
        id:           playlist.id          ?? '',
        name:         playlist.title       ?? '',
        description:  playlist.description ?? null,
        coverUrl:     playlist.coverUrl    ?? null,
        ownerName:    playlist.creatorName ?? '',
        tracksCount:  playlist.totalTracks ?? tracks.length,
        isSubscribed: false, // TODO: підключити після реалізації підписок на бекенді
    };

    // EditPlaylistModal очікує isPrivate: boolean — конвертуємо з visibility
    const playlistToEdit: PlaylistToEdit = {
        id:          playlist.id          ?? '',
        name:        playlist.title       ?? '',
        description: playlist.description ?? null,
        coverUrl:    playlist.coverUrl    ?? null,
        isPrivate:   playlist.visibility  === PlaylistVisibility.Private,
    };

    // ── Рендер ────────────────────────────────────────────────────────────────
    return (
        <div className="playlist-page">

            {/* Хедер з обкладинкою, назвою, кнопками дій */}
            <PlaylistPageHeader
                playlist={playlistForHeader}
                isOwner={isOwner}
                tracksCount={tracks.length}
                onPlay={() => console.log('play all')}        // TODO: плеєр
                onEdit={() => setShowEdit(true)}
                onDelete={() => setShowDelete(true)}
                onShare={() => console.log('share')}          // TODO
                onSubscribe={() => console.log('subscribe')}  // TODO: після реалізації підписок
            />

            {/* Список треків */}
            <div className="playlist-page__tracks">
                {/* Заголовки колонок */}
                <div className="playlist-page__columns">
                    <div className="playlist-page__col-index">#</div>
                    <div className="playlist-page__col-title">Назва</div>
                    <div className="playlist-page__col-album d-none d-md-block">Альбом</div>
                    <div className="playlist-page__col-date d-none d-lg-block">Дата додавання</div>
                    <div className="playlist-page__col-duration">
                        <i className="bi bi-clock" />
                    </div>
                </div>

                <hr className="playlist-page__divider" />

                {tracks.length === 0 ? (
                    <p className="text-secondary text-center mt-4">
                        У цьому плейлісті ще немає треків
                    </p>
                ) : (
                    tracks.map((track) => (
                        <TrackRow
                            key={track.id}
                            track={track}
                            allTracks={tracks}
                            sourceType="Playlist"
                            sourceId={playlistId}
                            onAddToPlaylist={(id) => handleAddToPlaylist(id, track.title)}
                            showAddToPlaylist
                        />
                    ))
                )}
            </div>

            {/* Рекомендації */}
            <PlaylistRecommendations
                playlistId={playlistId}
                isOwner={isOwner}
                onAddToPlaylist={handleAddToPlaylist}
            />

            {/* Модалки */}
            <AddToPlaylistModal
                isOpen={!!addToPlaylistTrackId}
                onClose={() => setAddToPlaylistTrackId(null)}
                trackId={addToPlaylistTrackId ?? ''}
                trackTitle={addToPlaylistTitle}
                onCreatePlaylist={() => {
                    setAddToPlaylistTrackId(null);
                    setShowCreate(true);
                }}
            />

            {showEdit && (
                <EditPlaylistModal
                    isOpen={showEdit}
                    onClose={() => setShowEdit(false)}
                    onSuccess={handleEditSuccess}
                    playlist={playlistToEdit}
                />
            )}

            <DeletePlaylistModal
                isOpen={showDelete}
                onClose={() => setShowDelete(false)}
                onSuccess={handleDeleteSuccess}
                playlistName={playlist.title ?? ''}
                playlistId={playlist.id ?? ''}
            />

            <CreatePlaylistModal
                isOpen={showCreate}
                onClose={() => setShowCreate(false)}
                onSuccess={() => setShowCreate(false)}
            />
        </div>
    );
};