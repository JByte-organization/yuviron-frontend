'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { usePlayerStore } from '@/entities/player/model/playerStore';
import { useRightSidebar } from '@/widgets/layout/model/contexts';
import { useRightSidebarTrack } from '../lib/useRightSidebarTrack';
import { useFavoriteTrack } from '@/features/track/lib/useFavoriteTrack';
import { getImageUrl } from '@/shared/lib/getImageUrl';
import {
    useGetApiArtistsId,
    usePostApiArtistsIdFollow,
    useDeleteApiArtistsIdFollow,
} from '@repo/api/client.ts';

import type { ArtistDetailsDto } from '@repo/api/client.ts';

const formatListeners = (count?: number): string => {
    if (!count) return '';
    return count.toLocaleString('uk-UA') + ' слухачів на місяць';
};

interface RightSidebarProps {
    onOpenManually: () => void;
}

export const RightSidebar = ({ onOpenManually }: RightSidebarProps) => {
    const queryClient = useQueryClient();
    const { isOpen, close } = useRightSidebar();

    useRightSidebarTrack();

    const currentTrack = usePlayerStore(s => s.currentTrack);

    // ── 1. ЛАЙК ТРЕКУ ─────────────────────────────────────────────
    const { isLiked, isPending: isLikePending, toggle: toggleLike } = useFavoriteTrack({
        initialLiked: (currentTrack as any)?.isSaved ?? false,
    });

    // ── 2. ДАНІ АРТИСТА ───────────────────────────────────────────
    const artistId = currentTrack?.artistId ?? '';
    const artistQueryKey = [`/api/artists/${artistId}`];

    const { data: artistRaw } = useGetApiArtistsId(artistId, {
        query: {
            enabled:  !!artistId,
            queryKey: artistQueryKey,
        },
    });

    const artist = (artistRaw as any)?.data ?? (artistRaw as unknown as ArtistDetailsDto | undefined);
    const isFollowing = artist?.isFollowed ?? false;

    // ── 3. МИТТЄВА ОПТИМІСТИЧНА ПІДПИСКА БЕЗ МИГОТІННЯ ──────────────
    const { mutate: follow, isPending: isFollowPending } = usePostApiArtistsIdFollow();
    const { mutate: unfollow, isPending: isUnfollowPending } = useDeleteApiArtistsIdFollow();

    const handleFollowToggle = async () => {
        if (!currentTrack?.artistId) return;

        const nextFollowState = !isFollowing;

        // Скасовуємо поточні запити, щоб вони не перезаписали наш оптимістичний стейт
        await queryClient.cancelQueries({ queryKey: artistQueryKey });
        const previousArtistData = queryClient.getQueryData(artistQueryKey);

        // Миттєво міняємо стан у кеші для UI
        queryClient.setQueryData(artistQueryKey, (old: any) => {
            if (!old) return old;
            return { ...old, isFollowed: nextFollowState };
        });

        const mutationOptions = {
            // 🌟 ФІКС: Інвалідуємо кеш ТІЛЬКИ після залізобетонного успіху сервера
            onSuccess: () => {
                void queryClient.invalidateQueries({ queryKey: artistQueryKey });
                void queryClient.invalidateQueries({ queryKey: ['getApiMeFollowingArtists'] });
            },
            onError: () => {
                // Якщо сервер відхилив запит — повертаємо назад як було
                queryClient.setQueryData(artistQueryKey, previousArtistData);
            }
        };

        if (isFollowing) {
            unfollow({ id: currentTrack.artistId }, mutationOptions);
        } else {
            follow({ id: currentTrack.artistId }, mutationOptions);
        }
    };

    // ── 4. ЗОБРАЖЕННЯ ТА ПЛЕЙСХОЛДЕРИ ──────────────────────────────
    const coverSrc = getImageUrl(currentTrack?.coverUrl) ?? 'images/track/default-cover.svg';
    const artistAvatarSrc = getImageUrl(artist?.avatarUrl) ?? '/images/artist/placeholder.png';

    return (
        <>
            <aside className={`right-sidebar${isOpen ? ' right-sidebar--open' : ''}`}>
                <div className="right-sidebar__inner">

                    <button className="right-sidebar__close-btn" onClick={close} aria-label="Закрити">
                        <i className="bi bi-x" />
                    </button>

                    {currentTrack ? (
                        <>
                            <div className="right-sidebar__cover">
                                <img src={coverSrc} alt={currentTrack.title} />
                            </div>

                            <div className="right-sidebar__track-info">
                                <div className="right-sidebar__track-meta">
                                    <div className="right-sidebar__track-texts">
                                        <Link href={`/tracks/${currentTrack.id}`} className="right-sidebar__track-title">
                                            {currentTrack.title}
                                        </Link>
                                        {currentTrack.artistId ? (
                                            <Link href={`/artists/${currentTrack.artistId}`} className="right-sidebar__track-artist">
                                                {currentTrack.artistNames.join(', ')}
                                            </Link>
                                        ) : (
                                            <span className="right-sidebar__track-artist">
                                                {currentTrack.artistNames.join(', ')}
                                            </span>
                                        )}
                                    </div>

                                    <div className="right-sidebar__track-actions">
                                        <button
                                            className={`right-sidebar__action-btn${isLiked ? ' right-sidebar__action-btn--active' : ''}`}
                                            onClick={() => toggleLike(currentTrack.id)}
                                            disabled={isLikePending}
                                            aria-label={isLiked ? 'Прибрати з улюблених' : 'Додати до улюблених'}
                                        >
                                            <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi bi-heart'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="right-sidebar__share">
                                <button className="right-sidebar__share-btn">
                                    <i className="bi bi-share" />
                                    <span>Поділитися треком</span>
                                </button>
                            </div>

                            <hr className="right-sidebar__divider" />

                            {artist && (
                                <div className="right-sidebar__about">
                                    <p className="right-sidebar__section-label">Про виконавця</p>

                                    <div className="right-sidebar__artist-card">
                                        <div className="right-sidebar__artist-avatar">
                                            <img src={artistAvatarSrc} alt={artist.name ?? ''} />
                                        </div>
                                        <div className="right-sidebar__artist-info">
                                            <Link href={`/artists/${currentTrack.artistId}`} className="right-sidebar__artist-name">
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
                <button className="right-sidebar__restore-btn" onClick={onOpenManually} aria-label="Показати інфо про трек">
                    <i className="bi bi-chevron-left" />
                </button>
            )}
        </>
    );
};