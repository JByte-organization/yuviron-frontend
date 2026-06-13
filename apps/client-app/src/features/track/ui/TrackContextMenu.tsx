'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface PlaylistMinDto {
    id: string;
    title: string;
}

interface TrackContextMenuProps {
    x: number;
    y: number;
    trackId: string;
    trackTitle: string;
    artistId?: string;
    artistNames: string[];
    isLiked: boolean;
    onClose: () => void;
    onToggleLike: () => void;
    myPlaylists?: PlaylistMinDto[];
    onAddToPlaylist?: (playlistId: string) => void;
    onCreatePlaylist?: () => void;
    onOpenModal?: () => void; // 🚨 ДОБАВИЛИ: Колбэк для открытия полноценной модалки
}

export const TrackContextMenu = ({
                                     x,
                                     y,
                                     trackId,
                                     trackTitle,
                                     artistId,
                                     artistNames,
                                     isLiked,
                                     onClose,
                                     onToggleLike,
                                     myPlaylists = [],
                                     onAddToPlaylist,
                                     onCreatePlaylist,
                                     onOpenModal, // 🚨
                                 }: TrackContextMenuProps) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const [activeSubmenu, setActiveSubmenu] = useState(false);

    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        setTimeout(() => window.addEventListener('click', handleOutsideClick), 10);
        return () => window.removeEventListener('click', handleOutsideClick);
    }, [onClose]);

    return (
        <div
            ref={menuRef}
            className="track-context-menu"
            style={{ top: y, left: x }}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.stopPropagation()}
        >
            <ul className="track-context-menu__list m-0 p-1 list-unstyled">

                {/* Добавить в плейлист */}
                <li
                    className="track-context-menu__item position-relative"
                    onMouseEnter={() => setActiveSubmenu(true)}
                    onMouseLeave={() => setActiveSubmenu(false)}
                >
                    {/* 🚨 ФИКС: Добавили onClick. Клик по строке откроет модалку и закроет контекстник */}
                    <div
                        className="track-context-menu__link d-flex align-items-center justify-content-between px-3 py-2"
                        onClick={() => { onOpenModal?.(); onClose(); }}
                    >
                        <span className="d-flex align-items-center gap-2">
                            <i className="bi bi-plus-lg" /> Додати до плейліста
                        </span>
                        <i className="bi bi-chevron-right small" />
                    </div>

                    {/* Субменю плейлистов */}
                    {activeSubmenu && (
                        <div className="track-context-menu__submenu">
                            <ul className="list-unstyled p-1 m-0 track-context-menu__submenu-list">
                                <li className="track-context-menu__item" onClick={onCreatePlaylist}>
                                    <div className="track-context-menu__link d-flex align-items-center gap-2 px-3 py-2 track-context-menu__link--create">
                                        <i className="bi bi-plus-circle" /> Створити плейліст
                                    </div>
                                </li>
                                {myPlaylists.length > 0 && <li className="track-context-menu__divider my-1" />}

                                {myPlaylists.map(p => (
                                    <li key={p.id} className="track-context-menu__item" onClick={() => { onAddToPlaylist?.(p.id); onClose(); }}>
                                        <div className="track-context-menu__link px-3 py-2 text-truncate">
                                            {p.title}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </li>

                {/* Любимые треки */}
                <li className="track-context-menu__item" onClick={() => { onToggleLike(); onClose(); }}>
                    <div className="track-context-menu__link d-flex align-items-center gap-2 px-3 py-2">
                        <i className={`bi ${isLiked ? 'bi-heart-fill text-success' : 'bi bi-heart'}`} />
                        {isLiked ? 'Видалити з улюблених' : 'Додати до улюблених'}
                    </div>
                </li>

                <li className="track-context-menu__divider my-1" />

                {/* К исполнителю */}
                {artistId && (
                    <li className="track-context-menu__item" onClick={onClose}>
                        <Link href={`/artists/${artistId}`} className="track-context-menu__link d-flex align-items-center gap-2 px-3 py-2">
                            <i className="bi bi-person" /> До виконавця
                        </Link>
                    </li>
                )}

                {/* Посмотреть сведения */}
                <li className="track-context-menu__item" onClick={onClose}>
                    <Link href={`/tracks/${trackId}`} className="track-context-menu__link d-flex align-items-center gap-2 px-3 py-2">
                        <i className="bi bi-info-circle" /> Відомості про трек
                    </Link>
                </li>
            </ul>
        </div>
    );
};