'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';

import {
    useGetApiPlaylistsId,
    useGetApiPlaylistsIdTracks,
    useGetApiAuthMe,
    usePutApiMePlaylistsId,
    useDeleteApiMePlaylistsId,
    usePatchApiMePlaylistsIdTracksTrackIdPosition,
    usePostApiMarketingSmartlinks,
    getGetApiPlaylistsIdTracksQueryKey,
    type PlaylistDetailsClientDto,
    type PlaylistTrackItemClientDto,
    type CurrentUserDto,
    type UpdatePlaylistRequest,
} from '@repo/api/client.ts';

import { TrackRow, type TrackRowData as BaseTrackRowData } from '@/entities/track/ui/TrackRow';
import { AddToPlaylistModal } from '@/features/playlist/add/ui/AddToPlaylistModal';
import { EditPlaylistModal, type PlaylistToEdit } from '@/features/playlist/edit/ui/EditPlaylistModal';
import { DeletePlaylistModal } from '@/features/playlist/detete/ui/DeletePlaylistModal';
import { CreatePlaylistModal } from '@/features/playlist/create/ui/CreatePlaylistModal';
import { ReportPlaylistModal } from '@/features/complaint/ui/ReportPlaylistModal';
import { PlaylistPageHeader } from './ui/PlaylistPageHeader';
import { PlaylistRecommendations } from './ui/PlaylistRecommendations';
import { PlaylistVisibility } from "@repo/api/generated/client/models";

interface PlaylistPageProps {
    playlistId: string;
}

interface TrackRowData extends BaseTrackRowData {
    position: number;
}

const mapTrack = (t: PlaylistTrackItemClientDto, index: number): TrackRowData => ({
    id:          t.trackId   ?? '',
    index:       index + 1,
    title:       t.title     ?? '',
    artistNames: t.artists?.map(a => a.name ?? '') ?? [],
    artistId:    t.artists?.[0]?.id ?? undefined,
    albumId:     t.albumId   ?? undefined,
    albumTitle:  null,
    addedAt:     t.addedAt   ?? null,
    durationMs:  t.durationMs ?? null,
    coverUrl:    t.coverUrl  ?? null,
    position:    t.position  ?? 0,
    isSaved:     t.isSaved ?? (t as any).isLiked ?? false,
});

export const PlaylistPage = ({ playlistId }: PlaylistPageProps) => {
    const router = useRouter();
    const queryClient = useQueryClient();

    // ── Запити даних ──────────────────────────────────────────────────────────
    const { data: playlistRaw, isLoading: playlistLoading, refetch: refetchPlaylist } = useGetApiPlaylistsId(playlistId);
    const { data: meRaw } = useGetApiAuthMe();

    const queryKey = getGetApiPlaylistsIdTracksQueryKey(playlistId, { Page: 1, PageSize: 50 });
    const { data: tracksRaw, isLoading: tracksLoading } = useGetApiPlaylistsIdTracks(playlistId, { Page: 1, PageSize: 50 });

    const playlist   = playlistRaw  as unknown as PlaylistDetailsClientDto;
    const tracksData = tracksRaw   as unknown as { items?: PlaylistTrackItemClientDto[] };
    const me         = meRaw        as unknown as CurrentUserDto;

    const tracks: TrackRowData[] = useMemo(() => {
        const list = (tracksData?.items ?? []).map(mapTrack);
        return list.sort((a, b) => a.position - b.position).map((t, idx) => ({
            ...t,
            index: idx + 1
        }));
    }, [tracksData]);

    const isOwner = !!me?.id && !!playlist?.creatorId && me.id === playlist.creatorId;

    // ── Мутації ───────────────────────────────────────────────────────────────
    const { mutateAsync: updatePlaylist } = usePutApiMePlaylistsId();
    const { mutateAsync: deletePlaylist } = useDeleteApiMePlaylistsId();
    const { mutateAsync: patchTrackPosition } = usePatchApiMePlaylistsIdTracksTrackIdPosition();
    const { mutateAsync: generateSmartLink } = usePostApiMarketingSmartlinks();

    // ── Стан модалок та сповіщень ─────────────────────────────────────────────
    const [addToPlaylistTrackId, setAddToPlaylistTrackId] = useState<string | null>(null);
    const [addToPlaylistTitle,   setAddToPlaylistTitle]   = useState('');
    const [showEdit,   setShowEdit]   = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [showReport, setShowReport] = useState(false); // Стейт модалки жалобы
    const [successToast, setSuccessToast] = useState<string | null>(null); // Стейт для тоста

    const triggerToast = (msg: string) => {
        setSuccessToast(msg);
        setTimeout(() => setSuccessToast(null), 3500);
    };

    // ─── ОБРОБНИК ГЕНЕРАЦІЇ ТА КОПІЮВАННЯ ССИЛКИ ПОДІЛИТИСЯ ──────────────────
    const handleSharePlaylist = async () => {
        try {
            // Вызываем команду CreateSmartLinkCommand с типом Playlist
            const response = await generateSmartLink({
                data: {
                    entityType: 'Playlist',
                    entityId: playlistId
                }
            });

            const resData = (response as any)?.data || response;
            const finalUrl = resData?.url || resData?.code || window.location.href;

            // Копируем ссылку в буфер обмена
            await navigator.clipboard.writeText(finalUrl);
            triggerToast("Посилання скопійовано!");
        } catch (error) {
            console.error('[Share Error] Не вдалося згенерувати смарт-посилання:', error);
            // Резервный фолбек на текущий URL браузера, если бэкенд упал
            try {
                await navigator.clipboard.writeText(window.location.href);
                triggerToast("Посилання скопійовано!");
            } catch (e) {
                console.error(e);
            }
        }
    };

    const calculateNewPosition = (items: TrackRowData[], movedIndex: number): number => {
        if (items.length === 1) return 65536.0;
        if (movedIndex === 0) {
            const nextTrack = items[1];
            return nextTrack.position - 65536.0;
        }
        if (movedIndex === items.length - 1) {
            const previousTrack = items[items.length - 2];
            return previousTrack.position + 65536.0;
        }
        const previousTrack = items[movedIndex - 1];
        const nextTrack = items[movedIndex + 1];
        return (previousTrack.position + nextTrack.position) / 2.0;
    };

    const handleDragEnd = async (result: DropResult) => {
        const { source, destination } = result;
        if (!destination) return;

        const sourceIndex = source.index;
        const destIndex = destination.index;
        if (sourceIndex === destIndex) return;

        const reorderedTracks = [...tracks];
        const [movedTrack] = reorderedTracks.splice(sourceIndex, 1);

        const updatedTrack = { ...movedTrack };
        reorderedTracks.splice(destIndex, 0, updatedTrack);

        const calculatedPos = calculateNewPosition(reorderedTracks, destIndex);
        updatedTrack.position = calculatedPos;

        queryClient.setQueryData(queryKey, (old: any) => {
            if (!old || !old.items) return old;
            const updatedItems = old.items.map((item: any) => {
                if (item.trackId === updatedTrack.id) {
                    return { ...item, position: calculatedPos };
                }
                return item;
            });
            return { ...old, items: updatedItems };
        });

        try {
            await patchTrackPosition({
                id: playlist?.id || playlistId,
                trackId: updatedTrack.id,
                data: { newPosition: calculatedPos } as Parameters<typeof patchTrackPosition>[0]['data']
            });
        } catch (error) {
            console.error('[DND Error] Бекенд відхилив PATCH-запит позиції треку:', error);
            void queryClient.invalidateQueries({ queryKey });
        }
    };

    const handleAddToPlaylist = (trackId: string, title: string) => {
        setAddToPlaylistTrackId(trackId);
        setAddToPlaylistTitle(title);
    };

    const handleEditSuccess = async (values: {
        name: string;
        coverFileId: string | null;
        coverUrl: string | null;
        isPrivate: boolean;
    }) => {
        const body: UpdatePlaylistRequest = {
            title:       values.name,
            coverFileId: values.coverFileId,
            visibility:  values.isPrivate ? PlaylistVisibility.Private : PlaylistVisibility.Public,
        };

        queryClient.setQueryData(['getApiPlaylistsId', playlistId], (old: any) => {
            if (!old) return old;
            return {
                ...old,
                title: values.name,
                coverUrl: values.coverUrl ?? old.coverUrl
            };
        });

        try {
            await updatePlaylist({ id: playlistId, data: body });
            await refetchPlaylist();
        } catch (error) {
            console.error('[Edit Error] Не вдалося зберегти зміни плейліста:', error);
        }
    };

    const handleDeleteSuccess = async () => {
        await deletePlaylist({ id: playlistId });
        router.push('/library');
    };

    if (playlistLoading || tracksLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                <div className="spinner-border text-light" role="status"><span className="visually-hidden">Завантаження...</span></div>
            </div>
        );
    }

    if (!playlist) return <div className="text-center text-secondary mt-5">Плейліст не знадено</div>;

    const playlistForHeader = {
        id:           playlist.id          ?? '',
        name:         playlist.title       ?? '',
        description:  playlist.description ?? null,
        coverUrl:     playlist.coverUrl    ?? null,
        ownerName:    playlist.creatorName ?? '',
        creatorId:    playlist.creatorId   ?? '',
        tracksCount:  playlist.totalTracks ?? tracks.length,
        isSubscribed: false,
    };

    const playlistToEdit: PlaylistToEdit = {
        id:          playlist.id          ?? '',
        name:        playlist.title       ?? '',
        coverUrl:    playlist.coverUrl    ?? null,
        isPrivate:   playlist.visibility  === PlaylistVisibility.Private,
    };

    return (
        <div className="playlist-page">
            <PlaylistPageHeader
                playlist={playlistForHeader}
                isOwner={isOwner}
                tracks={tracks}
                onEdit={() => setShowEdit(true)}
                onDelete={() => setShowDelete(true)}
                onShare={handleSharePlaylist}
                onReport={() => setShowReport(true)}
            />

            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="playlist-page__tracks">
                    <div className="playlist-page__columns">
                        <div className="playlist-page__col-index">#</div>
                        <div className="playlist-page__col-title">Назва</div>
                        <div className="playlist-page__col-album d-none d-md-block">Альбом</div>
                        <div className="playlist-page__col-date d-none d-lg-block">Дата додавання</div>
                        <div className="playlist-page__col-duration"><i className="bi bi-clock" /></div>
                    </div>

                    <hr className="playlist-page__divider" />

                    {tracks.length === 0 ? (
                        <p className="text-secondary text-center mt-4">У цьому плейлісті ще немає треків</p>
                    ) : (
                        <Droppable droppableId="playlist-tracks-droppable">
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="d-flex flex-column gap-1"
                                >
                                    {tracks.map((track, index) => (
                                        <Draggable
                                            key={track.id}
                                            draggableId={track.id}
                                            index={index}
                                            isDragDisabled={!isOwner}
                                        >
                                            {(providedSnapshot, snapshot) => (
                                                <div
                                                    ref={providedSnapshot.innerRef}
                                                    {...providedSnapshot.draggableProps}
                                                    {...providedSnapshot.dragHandleProps}
                                                    className={`playlist-page__draggable-row-holder ${snapshot.isDragging ? 'playlist-page__draggable-row-holder--dragging' : ''}`}
                                                >
                                                    <TrackRow
                                                        key={`${track.id}-${track.isSaved}`}
                                                        track={track}
                                                        allTracks={tracks}
                                                        sourceType="Playlist"
                                                        sourceId={playlistId}
                                                    />
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    )}
                </div>
            </DragDropContext>

            <PlaylistRecommendations playlistId={playlistId} isOwner={isOwner} onAddToPlaylist={handleAddToPlaylist} />

            <AddToPlaylistModal isOpen={!!addToPlaylistTrackId} onClose={() => setAddToPlaylistTrackId(null)} trackId={addToPlaylistTrackId ?? ''} trackTitle={addToPlaylistTitle} onCreatePlaylist={() => { setAddToPlaylistTrackId(null); setShowCreate(true); }} />
            {showEdit && <EditPlaylistModal isOpen={showEdit} onClose={() => setShowEdit(false)} onSuccess={handleEditSuccess} playlist={playlistToEdit} />}
            <DeletePlaylistModal isOpen={showDelete} onClose={() => setShowDelete(false)} onSuccess={handleDeleteSuccess} playlistName={playlist.title ?? ''} />
            <CreatePlaylistModal isOpen={showCreate} onClose={() => setShowCreate(false)} onSuccess={() => setShowCreate(false)} />

            {/* Рендеринг новой модалки жалобы */}
            {showReport && (
                <ReportPlaylistModal
                    isOpen={showReport}
                    onClose={() => setShowReport(false)}
                    playlistId={playlistId}
                    playlistName={playlist.title ?? ''}
                    onSuccess={() => triggerToast("Скарга успішно надіслана модераційному вузлу.")}
                />
            )}

            {/* ВСПЛЫВАЮЩИЙ ТОСТ СПРАВА СНИЗУ */}
            {successToast && (
                <div className="position-fixed bottom-0 end-0 m-4 p-3 rounded-3 shadow-lg border border-success bg-dark text-success" style={{ zIndex: 1100, fontSize: '13px' }}>
                    <span className="fw-semibold">✓ {successToast}</span>
                </div>
            )}
        </div>
    );
};