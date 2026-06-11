'use client';

import React, { useState, useMemo, useEffect } from 'react';
// 🚨 1. ІМПОРТУЄМО ПОРТАЛ ДЛЯ ВИХОДУ З КОНТЕКСТУ ПЛЕЄРА
import { createPortal } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/shared/ui/Modal';
import { lastPlaylistStorage } from '@/shared/lib/lastPlaylistStorage';
import { usePlaylistToast } from '@/shared/ui/PlaylistToast';
import { getImageUrl } from '@/shared/lib/getImageUrl';

import {
    useGetApiMePlaylists,
    usePostApiMePlaylistsIdTracks,
    useDeleteApiMePlaylistsIdTracksTrackId,
    type UserPlaylistDto
} from '@repo/api/client.ts';

interface AddToPlaylistModalProps {
    isOpen: boolean;
    onClose: () => void;
    trackId: string;
    trackTitle: string;
    onCreatePlaylist?: () => void;
}

const extractList = <T,>(raw: unknown): T[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw as T[];
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.data))  return obj.data  as T[];
    if (Array.isArray(obj.items)) return obj.items as T[];
    return [];
};

export const AddToPlaylistModal = ({
                                       isOpen,
                                       onClose,
                                       trackId,
                                       trackTitle,
                                       onCreatePlaylist,
                                   }: AddToPlaylistModalProps) => {
    const { showToast } = usePlaylistToast();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');

    // 🚨 2. ЗАХИСТ ВІД HYDRATION MISMATCH У NEXT.JS
    // Гарантує, що портал почне працювати лише на клієнті, коли DOM уже повністю готовий
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const { data: playlistsRaw, isLoading } = useGetApiMePlaylists(
        { PageSize: 50 },
        {
            query: { enabled: isOpen }
        } as unknown as Parameters<typeof useGetApiMePlaylists>[1]
    );

    const { mutateAsync: addTrack } = usePostApiMePlaylistsIdTracks();
    const { mutateAsync: removeTrack } = useDeleteApiMePlaylistsIdTracksTrackId();

    const [toggledIds, setToggledIds] = useState<Set<string>>(new Set());

    const playlists = useMemo(() => {
        return extractList<UserPlaylistDto>(playlistsRaw).map(p => ({
            id:          p.id ?? '',
            name:        p.title ?? 'Без назви',
            coverUrl:    getImageUrl(p.coverUrl),
            isPinned:    p.isSystem ?? false,
            isAdded:     false
        }));
    }, [playlistsRaw]);

    const filtered = useMemo(() => {
        if (!search) return playlists;
        return playlists.filter((p) =>
            p.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [search, playlists]);

    const handleToggle = async (playlist: { id: string; name: string; isAdded: boolean }) => {
        const isCurrentlyAdded = playlist.isAdded ? !toggledIds.has(playlist.id) : toggledIds.has(playlist.id);

        setToggledIds((prev) => {
            const next = new Set(prev);
            if (next.has(playlist.id)) next.delete(playlist.id);
            else next.add(playlist.id);
            return next;
        });

        try {
            if (isCurrentlyAdded) {
                await removeTrack({
                    id: playlist.id,
                    trackId: trackId
                });
            } else {
                await addTrack({
                    id: playlist.id,
                    data: { trackId } as Parameters<typeof addTrack>[0]['data']
                });

                lastPlaylistStorage.set(playlist.id, playlist.name);
                showToast({
                    trackId,
                    trackTitle,
                    playlistId: playlist.id,
                    playlistName: playlist.name,
                });
            }

            void queryClient.invalidateQueries({ queryKey: ['getApiMePlaylists'] });
        } catch (error) {
            console.error('[Playlist Mutation] Помилка:', error);
            setToggledIds((prev) => {
                const next = new Set(prev);
                if (next.has(playlist.id)) next.delete(playlist.id);
                else next.add(playlist.id);
                return next;
            });
        }
    };

    const handleClose = () => {
        setSearch('');
        setToggledIds(new Set());
        onClose();
    };

    // Якщо попап закритий або DOM ще не змонтувався — нічого не рендеримо
    if (!isOpen || !mounted) return null;

    // 🚨 3. ЗАГОРТАЄМО В ПОРТАЛ НА РІВЕНЬ DOCUMENT.BODY
    return createPortal(
        <Modal isOpen={isOpen} onClose={handleClose} title="Додати в плейліст" size="sm">
            <div className="add-playlist-modal__search-wrap mb-3">
                <i className="bi bi-search add-playlist-modal__search-icon" />
                <input
                    type="text"
                    className="client-modal__input add-playlist-modal__search"
                    placeholder="Пошук плейліста"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                />
            </div>

            <button className="add-playlist-modal__create-btn" onClick={() => { handleClose(); onCreatePlaylist?.(); }}>
                <span className="add-playlist-modal__create-icon"><i className="bi bi-plus" /></span>
                Створити плейліст
            </button>

            {isLoading ? (
                <div className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary" role="status" />
                </div>
            ) : (
                <ul className="add-playlist-modal__list list-unstyled m-0 p-0">
                    {filtered.map((playlist) => {
                        const isSelected = playlist.isAdded ? !toggledIds.has(playlist.id) : toggledIds.has(playlist.id);
                        const coverSrc = playlist.coverUrl ?? `https://picsum.photos/seed/pl-${playlist.id}/40/40`;

                        return (
                            <li key={playlist.id}>
                                <button className="add-playlist-modal__item" onClick={() => handleToggle(playlist)}>
                                    <div className="add-playlist-modal__cover"><img src={coverSrc} alt={playlist.name} /></div>
                                    <span className="add-playlist-modal__name">{playlist.name}</span>
                                    <div className="add-playlist-modal__icons">
                                        {playlist.isPinned && <i className="bi bi-pin-fill add-playlist-modal__pin-icon" />}
                                        <div className={`add-playlist-modal__check${isSelected ? ' add-playlist-modal__check--active' : ''}`}>
                                            {isSelected && <i className="bi bi-check" />}
                                        </div>
                                    </div>
                                </button>
                            </li>
                        );
                    })}

                    {filtered.length === 0 && <li className="add-playlist-modal__empty text-center text-muted small py-3">Плейлістів не знайдено</li>}
                </ul>
            )}

            <div className="client-modal__footer mt-3">
                <button className="client-modal__btn client-modal__btn--ghost w-100" onClick={handleClose}>Відміна</button>
            </div>
        </Modal>,
        document.body
    );
};