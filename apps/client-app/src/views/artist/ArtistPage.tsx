'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // 🚨 ФИКС: Импортируем роутер для переходов
import { useQueryClient } from '@tanstack/react-query';
import {
    useGetApiArtistsId,
    useGetApiArtistsIdTopTracks,
    useGetApiArtistsIdPopularReleases,
    useGetApiArtistsIdAlbums,
    useGetApiArtistsIdSingles,
    useGetApiArtistsIdRelatedTracks,
    useGetApiArtistsIdPlaylists,
    useGetApiArtistsIdSimilarArtists,
    useGetApiMeFollowingArtists,
    getGetApiMeFollowingArtistsQueryKey,
    usePostApiArtistsIdFollow,
    useDeleteApiArtistsIdFollow,
    type ArtistDetailsDto,
    type ArtistTopTrackDto,
    type ArtistAlbumDto,
    type RelatedTrackDto,
    type ArtistPlaylistDto,
    type SimilarArtistDto,
    type FollowedArtistDto,
} from '@repo/api/client.ts';

import { useSessionStore } from '@/entities/session/model/store';
import { useAuthGuard } from '@/shared/lib/useAuthGuard';

import { ArtistPageHeader } from './ui/ArtistPageHeader';
import { ArtistMusicSection } from './ui/ArtistMusicSection';
import { ArtistRelatedTracksSection } from './ui/ArtistRelatedTracksSection';
import { ArtistSimilarArtistsSection } from './ui/ArtistSimilarArtistsSection';
import { ArtistPlaylistsSection } from './ui/ArtistPlaylistsSection';
import { ArtistAboutSection } from './ui/ArtistAboutSection';
import { ArtistTopTracksSection } from '@/views/track/ui/ArtistTopTracksSection';

import { usePlayer } from '@/entities/player/lib/usePlayer';
import { usePlayerStore } from '@/entities/player/model/playerStore';
import { getImageUrl } from '@/shared/lib/getImageUrl';
import type { TrackCardData } from '@/entities/track/ui/TrackCard';

interface ArtistPageProps {
    artistId: string;
}

const extractList = <T,>(raw: unknown): T[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw as T[];
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.data))  return obj.data  as T[];
    if (Array.isArray(obj.items)) return obj.items as T[];
    return [];
};

export const ArtistPage = ({ artistId }: ArtistPageProps) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { playQueue, togglePlay } = usePlayer();
    const { requireAuth } = useAuthGuard();
    const accessToken = useSessionStore(s => s.accessToken);

    // Получаем состояние плеера для интерактивной кнопки Play в шапке
    const currentTrackId = usePlayerStore(s => s.currentTrack?.id);
    const playerStatus   = usePlayerStore(s => s.status);

    // ─── 1. ВСЕ ЗАПРОСЫ К API (Параллельный запуск через React Query) ────────
    const { data: artistData, isLoading: isArtistLoading } = useGetApiArtistsId(artistId);
    const { data: topTracksRaw } = useGetApiArtistsIdTopTracks(artistId, { limit: 5 });

    // Музыкальные релизы (табы)
    const { data: popularRaw, isLoading: isPopularLoading } = useGetApiArtistsIdPopularReleases(artistId);
    const { data: albumsRaw,  isLoading: isAlbumsLoading  } = useGetApiArtistsIdAlbums(artistId);
    const { data: singlesRaw, isLoading: isSinglesLoading } = useGetApiArtistsIdSingles(artistId);

    // Связанные треки, плейлисты и похожие артисты
    const { data: relatedRaw, isLoading: isRelatedLoading } = useGetApiArtistsIdRelatedTracks(artistId);
    const { data: playlistsRaw, isLoading: isPlaylistsLoading } = useGetApiArtistsIdPlaylists(artistId);
    const { data: similarRaw, isLoading: isSimilarLoading } = useGetApiArtistsIdSimilarArtists(artistId);

    const artist = (artistData?.data || artistData) as ArtistDetailsDto | undefined;

    // ─── Підписка на виконавця ───────────────────────────────────────────────
    // ArtistDetailsDto не віддає isFollowed → початковий стан беремо зі списку
    // «мої підписки» (лише для авторизованих). Стан тримаємо локально для
    // оптимістичного апдейту, синхронізуючи з відповіддю API.
    const followingParams = { PageSize: 1000 };
    const { data: followingRaw } = useGetApiMeFollowingArtists(followingParams, {
        query: {
            enabled: !!accessToken,
            queryKey: getGetApiMeFollowingArtistsQueryKey(followingParams),
        },
    });
    const isFollowedFromApi = useMemo(
        () => extractList<FollowedArtistDto>(followingRaw).some(a => a.artistId === artistId),
        [followingRaw, artistId],
    );

    const [isFollowing, setIsFollowing] = useState(false);
    useEffect(() => setIsFollowing(isFollowedFromApi), [isFollowedFromApi]);

    const followMutation   = usePostApiArtistsIdFollow();
    const unfollowMutation = useDeleteApiArtistsIdFollow();
    const followPending = followMutation.isPending || unfollowMutation.isPending;

    const handleFollow = () => {
        requireAuth(() => {
            const next = !isFollowing;
            setIsFollowing(next); // оптимістично
            const mutation = next ? followMutation : unfollowMutation;
            mutation.mutate(
                { id: artistId },
                {
                    onError: () => setIsFollowing(!next), // відкат
                    onSuccess: () => {
                        queryClient.invalidateQueries({
                            queryKey: getGetApiMeFollowingArtistsQueryKey(),
                        });
                    },
                },
            );
        });
    };

    // ─── 2. РАЗВЕРТЫВАНИЕ СПИСКОВ ДЛЯ СЕКЦИЙ ─────────────────────────────────
    const popularReleases = extractList<ArtistAlbumDto>(popularRaw);
    const albums          = extractList<ArtistAlbumDto>(albumsRaw);
    const singles         = extractList<ArtistAlbumDto>(singlesRaw);
    const relatedTracks   = extractList<RelatedTrackDto>(relatedRaw);
    const playlists       = extractList<ArtistPlaylistDto>(playlistsRaw);
    const similarArtists  = extractList<SimilarArtistDto>(similarRaw);

    // Мапимо топ-треки для кнопки "Play All" у хедері
    const topTracksMapped: TrackCardData[] = useMemo(() => {
        return extractList<ArtistTopTrackDto>(topTracksRaw).map(t => ({
            id:          t.id ?? '',
            title:       t.title ?? 'Без назви',
            artistNames: (t.artists ?? []).map(a => a.name ?? '').filter(Boolean),
            coverUrl:    getImageUrl(t.coverUrl),
            durationMs:  t.durationMs,
        }));
    }, [topTracksRaw]);

    // Вычисляем, играет ли сейчас какой-либо топ-трек этого артиста
    const isCollectionPlaying = useMemo(() => {
        if (playerStatus !== 'playing' || topTracksMapped.length === 0) return false;
        return topTracksMapped.some(t => t.id === currentTrackId);
    }, [topTracksMapped, currentTrackId, playerStatus]);

    // Общий первичный спиннер загрузки профиля
    if (isArtistLoading) {
        return (
            <div className="container-fluid px-lg-4 py-5 text-center">
                <div className="spinner-border text-primary" role="status" />
            </div>
        );
    }

    if (!artist) return <div className="container-fluid p-5">Виконавця не знайдено</div>;

    // Умный обработчик кнопки Play в шапке
    const handlePlayAllTopTracks = () => {
        if (topTracksMapped.length === 0) return;

        if (isCollectionPlaying) {
            togglePlay();
        } else {
            playQueue(topTracksMapped, 0, 'ArtistProfile', artistId);
        }
    };

    return (
        <div className="artist-page">
            <div className="container-fluid px-lg-4">
                {/* Хедер артиста */}
                <ArtistPageHeader
                    artistId={artistId}
                    name={artist.name ?? 'Невідомий виконавець'}
                    avatarUrl={artist.avatarUrl}
                    isVerified={artist.verificationStatus === 'Verified'}
                    monthlyListeners={artist.listenersCount}
                    isPlaying={isCollectionPlaying}
                    onPlay={handlePlayAllTopTracks}
                    onFollow={handleFollow}
                    isFollowing={isFollowing}
                    followPending={followPending}
                />

                {/* Популярні треки */}
                <ArtistTopTracksSection
                    artistId={artistId}
                    artistName={artist.name ?? ''}
                />

                {/* Музика — популярні релизы, альбоми, сингли */}
                <ArtistMusicSection
                    artistId={artistId}
                    artistName={artist.name ?? ''}
                    popularReleases={popularReleases}
                    albums={albums}
                    singles={singles}
                    isLoading={isPopularLoading || isAlbumsLoading || isSinglesLoading}
                    onAlbumClick={(id) => router.push(`/albums/${id}`)}
                />

                {/* Вас може зацікавити */}
                <ArtistRelatedTracksSection
                    artistId={artistId}
                    tracks={relatedTracks}
                    isLoading={isRelatedLoading}
                    onTrackClick={(queue, index) => {
                        playQueue(queue, index, 'ArtistProfile', artistId);
                    }}
                />

                {/* Шанувальникам також подобаються */}
                <ArtistSimilarArtistsSection
                    artistId={artistId}
                    artists={similarArtists}
                    isLoading={isSimilarLoading}
                    onArtistClick={(id) => router.push(`/artists/${id}`)}
                />

                {/* Плейлісти виконавця */}
                <ArtistPlaylistsSection
                    artistId={artistId}
                    artistName={artist.name ?? ''}
                    playlists={playlists}
                    isLoading={isPlaylistsLoading}
                    onPlaylistClick={(id) => router.push(`/playlists/${id}`)}
                />

                {/* Про виконавця */}
                <ArtistAboutSection
                    artistId={artistId}
                    monthlyListeners={artist.listenersCount}
                    bio={artist.bio}
                    bannerUrl={artist.bannerUrl}
                />
            </div>
        </div>
    );
};