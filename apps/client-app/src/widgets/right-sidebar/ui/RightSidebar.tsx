'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePlayerStore } from '@/entities/player/model/playerStore';
import { useRightSidebar } from '@/widgets/layout/model/contexts';
import { useRightSidebarTrack } from '../lib/useRightSidebarTrack';
import { useFavoriteTrack } from '@/features/track/lib/useFavoriteTrack';
import { getImageUrl } from '@/shared/lib/getImageUrl';
import {
    useGetApiArtistsId,
    usePostApiArtistsIdFollow,
    useDeleteApiArtistsIdFollow,
} from '@repo/api';

import type { ArtistDetailsDto } from '@repo/api/generated/client/models/artistDetailsDto';


// ══════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════
const formatListeners = (count?: number): string => {
    if (!count) return '';
    return count.toLocaleString('uk-UA') + ' слухачів на місяць';
};

// ══════════════════════════════════════════════════════════
// PROPS
// ══════════════════════════════════════════════════════════
interface RightSidebarProps {
    onOpenManually: () => void;
}

// ══════════════════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════════════════
export const RightSidebar = ({ onOpenManually }: RightSidebarProps) => {
    const { isOpen, close } = useRightSidebar();

    // Відкриваємо сайдбар при старті треку (якщо юзер не закрив)
    useRightSidebarTrack();

    const currentTrack = usePlayerStore(s => s.currentTrack);

    // ── Лайк треку ────────────────────────────────────────
    const { isLiked, isPending: isLikePending, toggle: toggleLike } = useFavoriteTrack({
        initialLiked: false, // TODO: передати isLiked з DTO коли бекенд додасть поле
    });

    // ── Підписка на артиста — оптимістичний UI ────────────
    const [isFollowing, setIsFollowing] = useState(false);

    const { mutate: follow,   isPending: isFollowPending }   = usePostApiArtistsIdFollow();
    const { mutate: unfollow, isPending: isUnfollowPending } = useDeleteApiArtistsIdFollow();

    const handleFollowToggle = () => {
        if (!currentTrack?.artistId) return;
        if (isFollowing) {
            setIsFollowing(false);
            unfollow(
                { id: currentTrack.artistId },
                { onError: () => setIsFollowing(true) },
            );
        } else {
            setIsFollowing(true);
            follow(
                { id: currentTrack.artistId },
                { onError: () => setIsFollowing(false) },
            );
        }
    };

    // ── Дані артиста — завантажуємо тільки якщо є artistId ─
    const artistId = currentTrack?.artistId ?? '';
    const { data: artistRaw } = useGetApiArtistsId(artistId, {
        query: {
            enabled:  !!artistId,
            queryKey: [`/api/artists/${artistId}`],
        },
    });

    // Наш mutator повертає дані напряму без обгортки { data, status }
    const artist = artistRaw as unknown as ArtistDetailsDto | undefined;

    // ── Обкладинка треку ──────────────────────────────────
    const coverSrc = getImageUrl(currentTrack?.coverUrl)
        ?? `https://picsum.photos/seed/track-${currentTrack?.id}/300/300`;

    // ── Аватар артиста ────────────────────────────────────
    const artistAvatarSrc = getImageUrl(artist?.avatarUrl)
        ?? `https://picsum.photos/seed/artist-${artistId}/80/80`;

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
                                                {currentTrack.artistNames.join(', ')}
                                            </Link>
                                        ) : (
                                            <span className="right-sidebar__track-artist">
                                                {currentTrack.artistNames.join(', ')}
                                            </span>
                                        )}
                                    </div>

                                    {/* Лайк + плейліст */}
                                    <div className="right-sidebar__track-actions">
                                        <button
                                            className={`right-sidebar__action-btn${isLiked ? ' right-sidebar__action-btn--active' : ''}`}
                                            onClick={() => toggleLike(currentTrack.id)}
                                            disabled={isLikePending}
                                            aria-label={isLiked ? 'Прибрати з улюблених' : 'Додати до улюблених'}
                                        >
                                            <i className={`bi bi-heart${isLiked ? '-fill' : ''}`} />
                                        </button>
                                        <button
                                            className="right-sidebar__action-btn"
                                            aria-label="Додати до плейліста"
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

                            <hr className="right-sidebar__divider" />

                            {/* ─── Про артиста ──────────── */}
                            {artist && (
                                <div className="right-sidebar__about">
                                    <p className="right-sidebar__section-label">Про виконавця</p>

                                    <div className="right-sidebar__artist-card">
                                        <div className="right-sidebar__artist-avatar">
                                            <img src={artistAvatarSrc} alt={artist.name ?? ''} />
                                        </div>
                                        <div className="right-sidebar__artist-info">
                                            <Link
                                                href={`/artists/${currentTrack.artistId}`}
                                                className="right-sidebar__artist-name"
                                            >
                                                {artist.name}
                                            </Link>
                                            {!!artist.listenersCount && (
                                                <p className="right-sidebar__artist-listeners">
                                                    {formatListeners(artist.listenersCount)}
                                                </p>
                                            )}
                                        </div>

                                        {currentTrack.artistId && (
                                            <button
                                                className={`right-sidebar__follow-btn${isFollowing ? ' right-sidebar__follow-btn--active' : ''}`}
                                                onClick={handleFollowToggle}
                                                disabled={isFollowPending || isUnfollowPending}
                                            >
                                                {isFollowing ? 'Стежу' : 'Стежити'}
                                            </button>
                                        )}
                                    </div>

                                    {artist.bio && (
                                        <p className="right-sidebar__artist-bio">
                                            {artist.bio}
                                        </p>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="right-sidebar__empty">
                            <i className="bi bi-music-note-beamed" />
                            <p>Оберіть трек для відтворення</p>
                        </div>
                    )}
                </div>
            </aside>

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