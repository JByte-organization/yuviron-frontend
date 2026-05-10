'use client';

import React, { useState } from 'react';
import { TrackRow, type TrackRowData } from '@/entities/track/ui/TrackRow';
import { AddToPlaylistModal } from '@/features/playlist/add/ui/AddToPlaylistModal';
import { EditPlaylistModal, type PlaylistToEdit } from '@/features/playlist/edit/ui/EditPlaylistModal';
import { DeletePlaylistModal } from '@/features/playlist/detete/ui/DeletePlaylistModal';
import { CreatePlaylistModal } from '@/features/playlist/create/ui/CreatePlaylistModal';
import { PlaylistPageHeader } from './ui/PlaylistPageHeader';
import { PlaylistRecommendations } from './ui/PlaylistRecommendations';

interface PlaylistPageProps {
    playlistId: string;
}

// ─── Mock ──────────────────────────────────────────────────
// TODO: замінити на useGetApiPlaylistsId(playlistId)
const MOCK_PLAYLIST = {
    id: 'p1',
    name: 'Мій плейліст №2',
    description: null,
    coverUrl: null,
    isPrivate: false,
    ownerId: 'current-user', // якщо збігається з userId — це наш плейліст
    ownerName: 'HannaD',
    tracksCount: 18,
    isSubscribed: false,
};

const CURRENT_USER_ID = 'current-user'; // TODO: з useGetApiCurrentUser()

const MOCK_TRACKS: TrackRowData[] = [
    { id: '1',  index: 1,  title: 'How You Like That',   artistNames: ['BLACKPINK'],          artistId: 'bp',    albumId: 'a1', albumTitle: 'THE ALBUM',           addedAt: new Date().toISOString(),                           durationMs: 182000, coverUrl: null },
    { id: '2',  index: 2,  title: 'Ice Cream',           artistNames: ['BLACKPINK'],          artistId: 'bp',    albumId: 'a1', albumTitle: 'THE ALBUM',           addedAt: new Date().toISOString(),                           durationMs: 182000, coverUrl: null },
    { id: '3',  index: 3,  title: 'Playing With Fire',   artistNames: ['BLACKPINK'],          artistId: 'bp',    albumId: 'a2', albumTitle: 'The Show',            addedAt: new Date(Date.now() - 86400000).toISOString(),      durationMs: 162000, coverUrl: null },
    { id: '4',  index: 4,  title: 'Lovesick Girls',      artistNames: ['BLACKPINK'],          artistId: 'bp',    albumId: 'a2', albumTitle: 'The Show',            addedAt: new Date(Date.now() - 86400000).toISOString(),      durationMs: 224000, coverUrl: null },
    { id: '5',  index: 5,  title: 'Crazy Over You',      artistNames: ['BLACKPINK'],          artistId: 'bp',    albumId: 'a2', albumTitle: 'The Show',            addedAt: new Date(Date.now() - 2 * 86400000).toISOString(),  durationMs: 202000, coverUrl: null },
    { id: '6',  index: 6,  title: 'Forever Young',       artistNames: ['BLACKPINK'],          artistId: 'bp',    albumId: 'a2', albumTitle: 'The Show',            addedAt: new Date(Date.now() - 3 * 86400000).toISOString(),  durationMs: 202000, coverUrl: null },
    { id: '7',  index: 7,  title: 'Bet Yiu Wanna',       artistNames: ['BLACKPINK'],          artistId: 'bp',    albumId: 'a1', albumTitle: 'THE ALBUM',           addedAt: new Date(Date.now() - 5 * 86400000).toISOString(),  durationMs: 182000, coverUrl: null },
    { id: '8',  index: 8,  title: 'Rockstar',            artistNames: ['LISA'],               artistId: 'lisa',  albumId: 'a3', albumTitle: 'Alter Ego',           addedAt: '2025-04-02T00:00:00Z',                             durationMs: 166000, coverUrl: null },
];

/**
 * Сторінка: Плейліст /playlists/[id]
 *
 * Підключення даних:
 * 1. const { data: playlist } = useGetApiPlaylistsId(playlistId);
 * 2. const { data: tracks }   = useGetApiPlaylistsIdTracks(playlistId);
 * 3. const { data: me }       = useGetApiCurrentUser();
 * 4. isOwner = me?.id === playlist?.ownerId
 */
export const PlaylistPage = ({ playlistId }: PlaylistPageProps) => {
    const playlist = MOCK_PLAYLIST;
    const tracks   = MOCK_TRACKS;
    const isOwner  = playlist.ownerId === CURRENT_USER_ID;

    // ─── Модалки ──────────────────────────────────────────
    const [addToPlaylistTrackId, setAddToPlaylistTrackId] = useState<string | null>(null);
    const [addToPlaylistTitle,   setAddToPlaylistTitle]   = useState('');
    const [showEdit,   setShowEdit]   = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [showCreate, setShowCreate] = useState(false);

    const handleAddToPlaylist = (trackId: string, title: string) => {
        setAddToPlaylistTrackId(trackId);
        setAddToPlaylistTitle(title);
    };

    const playlistToEdit: PlaylistToEdit = {
        id:          playlist.id,
        name:        playlist.name,
        description: playlist.description,
        coverUrl:    playlist.coverUrl,
        isPrivate:   playlist.isPrivate,
    };

    return (
        <div className="playlist-page">

            {/* ─── Хедер ─────────────────────────── */}
            <PlaylistPageHeader
                playlist={playlist}
                isOwner={isOwner}
                tracksCount={tracks.length}
                onPlay={() => console.log('play all')}       // TODO: плеєр
                onEdit={() => setShowEdit(true)}
                onDelete={() => setShowDelete(true)}
                onShare={() => console.log('share')}         // TODO
                onSubscribe={() => console.log('subscribe')} // TODO: usePostApiPlaylistsIdSubscribe
            />

            {/* ─── Список треків ──────────────────── */}
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

                {/* Рядки треків */}
                {tracks.map((track) => (
                    <TrackRow
                        key={track.id}
                        track={track}
                        onClick={(id) => console.log('play', id)}  // TODO: плеєр
                        onLike={(id) => console.log('like', id)}   // TODO: хук
                        onAddToPlaylist={(id) => handleAddToPlaylist(id, track.title)}
                        showAddToPlaylist
                    />
                ))}
            </div>

            {/* ─── Рекомендації (завжди) ──────────── */}
            <PlaylistRecommendations
                playlistId={playlistId}
                isOwner={isOwner}
                onAddToPlaylist={handleAddToPlaylist}
            />

            {/* ─── Модалки ────────────────────────── */}
            <AddToPlaylistModal
                isOpen={!!addToPlaylistTrackId}
                onClose={() => setAddToPlaylistTrackId(null)}
                trackId={addToPlaylistTrackId ?? ''}
                trackTitle={addToPlaylistTitle}
                onCreatePlaylist={() => { setAddToPlaylistTrackId(null); setShowCreate(true); }}
            />

            {showEdit && (
                <EditPlaylistModal
                    isOpen={showEdit}
                    onClose={() => setShowEdit(false)}
                    onSuccess={() => setShowEdit(false)}
                    playlist={playlistToEdit}
                />
            )}

            <DeletePlaylistModal
                isOpen={showDelete}
                onClose={() => setShowDelete(false)}
                onSuccess={() => { setShowDelete(false); /* TODO: redirect */ }}
                playlistName={playlist.name}
                playlistId={playlist.id}
            />

            <CreatePlaylistModal
                isOpen={showCreate}
                onClose={() => setShowCreate(false)}
                onSuccess={() => setShowCreate(false)}
            />
        </div>
    );
};