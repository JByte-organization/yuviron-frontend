'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/shared/ui/Modal';
import { lastPlaylistStorage } from '@/shared/lib/lastPlaylistStorage';
import { usePlaylistToast } from '@/shared/ui/PlaylistToast';

// ─── Типи ─────────────────────────────────────────────────
interface PlaylistOption {
    id: string;
    name: string;
    coverUrl?: string | null;
    tracksCount?: number;
    isPinned?: boolean;
    isAdded?: boolean; // трек вже є в цьому плейлісті
}

interface AddToPlaylistModalProps {
    isOpen: boolean;
    onClose: () => void;
    trackId: string;
    trackTitle: string;
    /** TODO: замінити на useGetApiUserPlaylists() */
    playlists?: PlaylistOption[];
    onCreatePlaylist?: () => void;
}

// ─── Mock ──────────────────────────────────────────────────
const MOCK_PLAYLISTS: PlaylistOption[] = [
    { id: 'p1', name: "it's (not) ok",  coverUrl: null, isPinned: true,  isAdded: true  },
    { id: 'p2', name: 'Любимые треки',  coverUrl: null, isPinned: true,  isAdded: false },
    { id: 'p3', name: "'25 🔥",          coverUrl: null, isPinned: true,  isAdded: false },
    { id: 'p4', name: 'sea viiiibe',    coverUrl: null, isPinned: true,  isAdded: false },
    { id: 'p5', name: 'Мій плейлист №16', coverUrl: null, isPinned: false, isAdded: false },
    { id: 'p6', name: 'Not Today',      coverUrl: null, isPinned: false, isAdded: false },
];

export const AddToPlaylistModal = ({
                                       isOpen,
                                       onClose,
                                       trackId,
                                       trackTitle,
                                       playlists = MOCK_PLAYLISTS,
                                       onCreatePlaylist,
                                   }: AddToPlaylistModalProps) => {
    const { showToast } = usePlaylistToast();

    const [search, setSearch] = useState('');
    // Локальний стан — які плейлісти обрані
    const [selected, setSelected] = useState<Set<string>>(() => {
        return new Set(playlists.filter((p) => p.isAdded).map((p) => p.id));
    });

    // Скидаємо при відкритті
    useEffect(() => {
        if (isOpen) {
            setSearch('');
            setSelected(new Set(playlists.filter((p) => p.isAdded).map((p) => p.id)));
        }
    }, [isOpen, playlists]);

    const filtered = useMemo(() => {
        if (!search) return playlists;
        return playlists.filter((p) =>
            p.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [search, playlists]);

    const handleToggle = (playlist: PlaylistOption) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(playlist.id)) {
                next.delete(playlist.id);
            } else {
                next.add(playlist.id);
                // Зберігаємо як останній плейліст
                lastPlaylistStorage.set(playlist.id, playlist.name);
                // Показуємо toast
                showToast({
                    trackId,
                    trackTitle,
                    playlistId: playlist.id,
                    playlistName: playlist.name,
                });
            }
            return next;
        });
        // TODO: викликати API
        // if (selected.has(playlist.id)) {
        //     await deleteApiUserPlaylistsIdTracks({ id: playlist.id, trackId })
        // } else {
        //     await postApiUserPlaylistsIdTracks({ id: playlist.id, data: { trackId } })
        // }
    };

    const handleClose = () => {
        setSearch('');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Додати в плейліст"
            size="sm"
        >
            {/* Пошук */}
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

            {/* Створити плейліст */}
            <button
                className="add-playlist-modal__create-btn"
                onClick={() => { handleClose(); onCreatePlaylist?.(); }}
            >
                <span className="add-playlist-modal__create-icon">
                    <i className="bi bi-plus" />
                </span>
                Створити плейліст
            </button>

            {/* Список плейлістів */}
            <ul className="add-playlist-modal__list">
                {filtered.map((playlist) => {
                    const isSelected = selected.has(playlist.id);
                    const coverSrc = playlist.coverUrl
                        ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/${playlist.coverUrl}`
                        : `https://picsum.photos/seed/pl-${playlist.id}/40/40`;

                    return (
                        <li key={playlist.id}>
                            <button
                                className="add-playlist-modal__item"
                                onClick={() => handleToggle(playlist)}
                            >
                                {/* Обкладинка */}
                                <div className="add-playlist-modal__cover">
                                    <img src={coverSrc} alt={playlist.name} />
                                </div>

                                {/* Назва */}
                                <span className="add-playlist-modal__name">
                                    {playlist.name}
                                </span>

                                {/* Іконки справа */}
                                <div className="add-playlist-modal__icons">
                                    {playlist.isPinned && (
                                        <i className="bi bi-pin-fill add-playlist-modal__pin-icon" />
                                    )}
                                    <div className={`add-playlist-modal__check${isSelected ? ' add-playlist-modal__check--active' : ''}`}>
                                        {isSelected && <i className="bi bi-check" />}
                                    </div>
                                </div>
                            </button>
                        </li>
                    );
                })}

                {filtered.length === 0 && (
                    <li className="add-playlist-modal__empty">
                        Плейлістів не знайдено
                    </li>
                )}
            </ul>

            {/* Кнопка Відміна */}
            <div className="client-modal__footer">
                <button
                    className="client-modal__btn client-modal__btn--ghost"
                    onClick={handleClose}
                >
                    Відміна
                </button>
            </div>
        </Modal>
    );
};