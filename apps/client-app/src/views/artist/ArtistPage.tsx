'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
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
    getGetApiMeFollowingArtistsQueryKey,
    usePostApiArtistsIdFollow,
    useDeleteApiArtistsIdFollow,
    type ArtistDetailsDto,
    type ArtistTopTrackDto,
    type ArtistAlbumDto,
    type RelatedTrackDto,
    type ArtistPlaylistDto,
    type SimilarArtistDto,
} from '@repo/api/client.ts';

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

    const currentTrackId = usePlayerStore(s => s.currentTrack?.id);
    const playerStatus   = usePlayerStore(s => s.status);

    const { data: artistData, isLoading: isArtistLoading } = useGetApiArtistsId(artistId);
    const { data: topTracksRaw } = useGetApiArtistsIdTopTracks(artistId, { limit: 5 });

    const { data: popularRaw, isLoading: isPopularLoading } = useGetApiArtistsIdPopularReleases(artistId);
    const { data: albumsRaw,  isLoading: isAlbumsLoading  } = useGetApiArtistsIdAlbums(artistId);
    const { data: singlesRaw, isLoading: isSinglesLoading } = useGetApiArtistsIdSingles(artistId);

    const { data: relatedRaw, isLoading: isRelatedLoading } = useGetApiArtistsIdRelatedTracks(artistId);
    const { data: playlistsRaw, isLoading: isPlaylistsLoading } = useGetApiArtistsIdPlaylists(artistId);
    const { data: similarRaw, isLoading: isSimilarLoading } = useGetApiArtistsIdSimilarArtists(artistId);

    const artist = (artistData?.data || artistData) as ArtistDetailsDto | undefined;

    const apiFollowed = artist?.isFollowed ?? false;
    const [isFollowing, setIsFollowing] = useState(apiFollowed);
    const [prevApiFollowed, setPrevApiFollowed] = useState(apiFollowed);
    if (apiFollowed !== prevApiFollowed) {
        setPrevApiFollowed(apiFollowed);
        setIsFollowing(apiFollowed);
    }

    const followMutation   = usePostApiArtistsIdFollow();
    const unfollowMutation = useDeleteApiArtistsIdFollow();
    const followPending = followMutation.isPending || unfollowMutation.isPending;

    const handleFollow = () => {
        requireAuth(() => {
            const next = !isFollowing;
            setIsFollowing(next);
            const mutation = next ? followMutation : unfollowMutation;
            mutation.mutate(
                { id: artistId },
                {
                    onError: () => setIsFollowing(!next),
                    onSuccess: () => {
                        queryClient.invalidateQueries({
                            queryKey: getGetApiMeFollowingArtistsQueryKey(),
                        });
                    },
                },
            );
        });
    };

    const popularReleases = extractList<ArtistAlbumDto>(popularRaw);
    const albums          = extractList<ArtistAlbumDto>(albumsRaw);
    const singles         = extractList<ArtistAlbumDto>(singlesRaw);
    const relatedTracks   = extractList<RelatedTrackDto>(relatedRaw);
    const playlists       = extractList<ArtistPlaylistDto>(playlistsRaw);
    const similarArtists  = extractList<SimilarArtistDto>(similarRaw);

    const topTracksMapped: TrackCardData[] = useMemo(() => {
        return extractList<ArtistTopTrackDto>(topTracksRaw).map(t => ({
            id:          t.id ?? '',
            title:       t.title ?? 'Без назви',
            artistNames: (t.artists ?? []).map(a => a.name ?? '').filter(Boolean),
            coverUrl:    getImageUrl(t.coverUrl),
            durationMs:  t.durationMs,
        }));
    }, [topTracksRaw]);

    const isCollectionPlaying = useMemo(() => {
        if (playerStatus !== 'playing' || topTracksMapped.length === 0) return false;
        return topTracksMapped.some(t => t.id === currentTrackId);
    }, [topTracksMapped, currentTrackId, playerStatus]);

    if (isArtistLoading) {
        return (
            <div className="container-fluid px-lg-4 py-5 text-center">
                <div className="spinner-border text-primary" role="status" />
            </div>
        );
    }

    if (!artist) return <div className="container-fluid p-5">Виконавця не знайдено</div>;

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

                <ArtistTopTracksSection
                    artistId={artistId}
                    artistName={artist.name ?? ''}
                />

                <ArtistMusicSection
                    artistName={artist.name ?? ''}
                    popularReleases={popularReleases}
                    albums={albums}
                    singles={singles}
                    isLoading={isPopularLoading || isAlbumsLoading || isSinglesLoading}
                    onAlbumClick={(id) => router.push(`/albums/${id}`)}
                />

                <ArtistRelatedTracksSection
                    tracks={relatedTracks}
                    isLoading={isRelatedLoading}
                    onTrackClick={(queue, index) => {
                        playQueue(queue, index, 'ArtistProfile', artistId);
                    }}
                />

                <ArtistSimilarArtistsSection
                    artists={similarArtists}
                    isLoading={isSimilarLoading}
                    onArtistClick={(id) => router.push(`/artists/${id}`)}
                />


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