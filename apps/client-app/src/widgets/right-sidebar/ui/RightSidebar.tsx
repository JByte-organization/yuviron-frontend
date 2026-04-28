'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRightSidebar } from '@/widgets/layout/ui/ClientLayout';

// ─── Типи ─────────────────────────────────────────────────
export interface CurrentTrackInfo {
    id: string;
    title: string;
    artistId?: string;
    artistName: string;
    artistAvatarUrl?: string | null;
    artistMonthlyListeners?: number;
    artistBio?: string | null;
    albumId?: string;
    albumTitle?: string;
    coverUrl?: string | null;
}

interface RightSidebarProps {
    /** TODO: підключити до playerStore — usePlayerStore() */
    currentTrack?: CurrentTrackInfo | null;
    onOpenManually: () => void;
}

// ─── Mock даних (прибрати коли буде плеєр) ────────────────
const MOCK_TRACK: CurrentTrackInfo = {
    id: '1',
    title: 'Rockstar',
    artistId: 'lisa',
    artistName: 'LISA',
    artistAvatarUrl: null,
    artistMonthlyListeners: 72780975,
    artistBio: 'Południnokoreyska співачка LISA — учасниця BLACKPINK. Відома своїм унікальним стилем та неперевершеною харизмою.',
    albumId: 'alter-ego',
    albumTitle: 'Alter Ego',
    coverUrl: null,
};

const formatListeners = (count?: number): string => {
    if (!count) return '';
    return count.toLocaleString('uk-UA') + ' слухачів на місяць';
};

export const RightSidebar = ({
                                 currentTrack = MOCK_TRACK,
                                 onOpenManually,
                             }: RightSidebarProps) => {
    const { isOpen, close } = useRightSidebar();
    const [isLiked, setIsLiked] = useState(false);

    const coverSrc = currentTrack?.coverUrl
        ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/${currentTrack.coverUrl}`
        : `https://picsum.photos/seed/track-${currentTrack?.id}/300/300`;

    const artistAvatarSrc = currentTrack?.artistAvatarUrl
        ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/${currentTrack.artistAvatarUrl}`
        : `https://picsum.photos/seed/artist-${currentTrack?.artistId}/80/80`;

    return (
        <>
            {/* ─── Правий сайдбар ───────────────────────── */}
            <aside className={`right-sidebar${isOpen ? ' right-sidebar--open' : ''}`}>
                <div className="right-sidebar__inner">

                    {/* ─── Кнопка закрити ───────────────── */}
                    <button
                        className="right-sidebar__close-btn"
                        onClick={close}
                        aria-label="Закрити"
                    >
                        <i className="bi bi-x" />
                    </button>

                    {currentTrack ? (
                        <>
                            {/* ─── Обкладинка ───────────── */}
                            <div className="right-sidebar__cover">
                                <img src={coverSrc} alt={currentTrack.title} />
                            </div>

                            {/* ─── Назва + артист + дії ─── */}
                            <div className="right-sidebar__track-info">
                                <div className="right-sidebar__track-meta">
                                    <div className="right-sidebar__track-texts">
                                        <Link
                                            href={`/tracks/${currentTrack.id}`}
                                            className="right-sidebar__track-title"
                                        >
                                            {currentTrack.title}
                                        </Link>
                                        {currentTrack.artistId ? (
                                            <Link
                                                href={`/artists/${currentTrack.artistId}`}
                                                className="right-sidebar__track-artist"
                                            >
                                                {currentTrack.artistName}
                                            </Link>
                                        ) : (
                                            <span className="right-sidebar__track-artist">
                                                {currentTrack.artistName}
                                            </span>
                                        )}
                                    </div>

                                    {/* Дії: лайк + плейліст */}
                                    <div className="right-sidebar__track-actions">
                                        <button
                                            className={`right-sidebar__action-btn${isLiked ? ' right-sidebar__action-btn--active' : ''}`}
                                            onClick={() => setIsLiked((v) => !v)}
                                            aria-label="Додати до обраного"
                                            // TODO: usePostApiUserFavorites()
                                        >
                                            <i className={`bi bi-heart${isLiked ? '-fill' : ''}`} />
                                        </button>
                                        <button
                                            className="right-sidebar__action-btn"
                                            aria-label="Додати до плейліста"
                                            // TODO: відкрити модалку вибору плейліста
                                        >
                                            <i className="bi bi-plus-circle" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Поділитися ───────────── */}
                            <div className="right-sidebar__share">
                                <button className="right-sidebar__share-btn">
                                    <i className="bi bi-share" />
                                    <span>Поділитися треком</span>
                                </button>
                            </div>

                            {/* ─── Роздільник ───────────── */}
                            <hr className="right-sidebar__divider" />

                            {/* ─── Про артиста ──────────── */}
                            <div className="right-sidebar__about">
                                <p className="right-sidebar__section-label">Про виконавця</p>

                                <div className="right-sidebar__artist-card">
                                    <div className="right-sidebar__artist-avatar">
                                        <img src={artistAvatarSrc} alt={currentTrack.artistName} />
                                    </div>
                                    <div className="right-sidebar__artist-info">
                                        <Link
                                            href={`/artists/${currentTrack.artistId}`}
                                            className="right-sidebar__artist-name"
                                        >
                                            {currentTrack.artistName}
                                        </Link>
                                        {currentTrack.artistMonthlyListeners && (
                                            <p className="right-sidebar__artist-listeners">
                                                {formatListeners(currentTrack.artistMonthlyListeners)}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        className="right-sidebar__follow-btn"
                                        // TODO: usePostApiUserFollowArtist()
                                    >
                                        Стежити
                                    </button>
                                </div>

                                {currentTrack.artistBio && (
                                    <p className="right-sidebar__artist-bio">
                                        {currentTrack.artistBio}
                                    </p>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="right-sidebar__empty">
                            <i className="bi bi-music-note-beamed" />
                            <p>Оберіть трек для відтворення</p>
                        </div>
                    )}
                </div>
            </aside>

            {/* ─── Кнопка відкрити (коли закритий) ─────── */}
            {!isOpen && (
                <button
                    className="right-sidebar__restore-btn"
                    onClick={onOpenManually}
                    aria-label="Показати інфо про трек"
                >
                    <i className="bi bi-chevron-left" />
                </button>
            )}
        </>
    );
};