'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    useGetApiMeFavoritesTracks,
    useGetApiMeFollowingArtists,
    useGetApiMePlaylists,
    type UserFavoriteTrackDto,
    type FollowedArtistDto,
    type UserPlaylistDto,
} from '@repo/api/client.ts';
import { TopTracksSection } from '@/views/home/ui/sections/TopTracksSection';
import { FavoriteArtistsSection } from '@/views/home/ui/sections/FavoriteArtistsSection';
import { LibraryPlaylistsSection } from './ui/sections/LibraryPlaylistsSection';
import type { TrackCardData } from '@/entities/track/ui/TrackCard';
import type { ArtistCardData } from '@/entities/artist/ui/ArtistCard';
import type { PlaylistCardData } from '@/entities/playlist/ui/PlaylistCard';

// ─── Маппінги ─────────────────────────────────────────────────────────────────
// Перетворюємо відповіді API у формат, який очікують компоненти-секції.
// Кожен маппінг живе тут, а не всередині секції — секції залишаються "тупими".

const mapFavoriteTrack = (t: UserFavoriteTrackDto): TrackCardData => ({
    id:          t.trackId    ?? '',
    title:       t.title      ?? '',
    artistNames: t.artistNames?.map(a => a.name ?? '') ?? [],
    artistId:    t.artistNames?.[0]?.id ?? undefined,
    coverUrl:    t.coverUrl   ?? null,
    durationMs:  t.durationMs ?? undefined,
});


const mapFollowedArtist = (a: FollowedArtistDto): ArtistCardData => ({
    id:        a.artistId ?? '',
    name:      a.name     ?? '',
    avatarUrl: a.avatarUrl ?? null,
    // followersCount є в DTO — передаємо як monthlyListeners (найближчий аналог)
    monthlyListeners: a.followersCount ?? undefined,
});

const mapPlaylist = (p: UserPlaylistDto): PlaylistCardData => ({
    id:          p.id         ?? '',
    name:        p.title      ?? '',
    tracksCount: p.tracksCount ?? undefined,
    coverUrl:    p.coverUrl   ?? null,
});

// ─── Компонент ────────────────────────────────────────────────────────────────
export const LibraryPage = () => {
    const router = useRouter();

    // ── Запити даних ──────────────────────────────────────────────────────────
    const {
        data: tracksRaw,
        isLoading: tracksLoading,
    } = useGetApiMeFavoritesTracks({ Page: 1, PageSize: 10 });

    const {
        data: artistsRaw,
        isLoading: artistsLoading,
    } = useGetApiMeFollowingArtists({ Page: 1, PageSize: 10 });

    const {
        data: playlistsRaw,
        isLoading: playlistsLoading,
    } = useGetApiMePlaylists({ Page: 1, PageSize: 10 });

    
    const tracksData   = tracksRaw   as unknown as { items?: UserFavoriteTrackDto[] };
    const artistsData  = artistsRaw  as unknown as { items?: FollowedArtistDto[] };
    const playlistsData = playlistsRaw as unknown as { items?: UserPlaylistDto[] };

    const tracks    = (tracksData?.items   ?? []).map(mapFavoriteTrack);
    const artists   = (artistsData?.items  ?? []).map(mapFollowedArtist);
    const playlists = (playlistsData?.items ?? []).map(mapPlaylist);

    return (
        <div className="library-page">
            <h1 className="library-page__title">Моя медіатека</h1>

            {/* Улюблені треки */}
            <TopTracksSection
                sectionTitle="Улюблені треки"
                showAllHref="/favorites"
                tracks={tracks}
                isLoading={tracksLoading}
                onTrackClick={(id) => router.push(`/tracks/${id}`)}
            />

            {/* Плейлісти */}
            <LibraryPlaylistsSection
                playlists={playlists}
                isLoading={playlistsLoading}
                onPlaylistClick={(id) => router.push(`/playlist/${id}`)}
            />

            {/* Улюблені виконавці */}
            <FavoriteArtistsSection
                sectionTitle="Твої улюблені виконавці"
                artists={artists}
                isLoading={artistsLoading}
                onArtistClick={(id) => router.push(`/artists/${id}`)}
            />
        </div>
    );
};