'use client';

import React from 'react';
import {
    useGetApiHomeBanners,
    useGetApiHomeTopTracks,
    useGetApiHomeNewReleases,
    useGetApiHomeTopArtists,
    useGetApiMeFollowingArtists,
    useGetApiMoods,
    useGetApiGenres,
    type HomeBannerDto,
    type TopTrackDto,
    type TopArtistDto,
    type MoodItemDto,
    type GenreItemDto,
    type NewReleaseDto,
    type TrackArtistDto,
    type FollowedArtistDto, getGetApiHomeTopArtistsQueryKey, getGetApiMeFollowingArtistsQueryKey,
} from '@repo/api/client.ts';
import { HeroBannerSection, type BannerItem } from './ui/sections/HeroBannerSection';
import { MoodSection } from './ui/sections/MoodSection';
import { TopTracksSection } from './ui/sections/TopTracksSection';
import { NewReleasesSection } from './ui/sections/NewReleasesSection';
import { FavoriteArtistsSection } from './ui/sections/FavoriteArtistsSection';
import { getImageUrl } from '@/shared/lib/getImageUrl';
import type { MoodCardData } from '@/entities/mood/ui/MoodCard';
import type { TrackCardData } from '@/entities/track/ui/TrackCard';
import type { AlbumCardData } from '@/entities/album/ui/AlbumCard';
import type { ArtistCardData } from '@/entities/artist/ui/ArtistCard';

import { AllTracksSection } from './ui/sections/AllTracksSection';

import {TrackRow} from '@/entities/track/ui/TrackRow';
import type {TrackRowData} from '@/entities/track/ui/TrackRow';

// Прямо в JSX перед закриваючим </div>:
const TEST_TRACKS: TrackRowData[] = [
    { id: '7887272f-cbee-4f38-984a-a2e6e3732be7', index: 1, title: 'Тест трек 1', artistNames: ['Артист 1'], coverUrl: null },
    { id: 'fca53b2d-ac28-497d-9d62-ac6f2eb73e2e', index: 2, title: 'Тест трек 2', artistNames: ['Артист 2'], coverUrl: null },
];


interface HomePageProps {
    isAuthenticated?: boolean;
}

const extractList = <T,>(raw: unknown): T[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw as T[];
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.data))  return obj.data  as T[];
    if (Array.isArray(obj.items)) return obj.items as T[];
    return [];
};

export const HomePage = ({ isAuthenticated = false }: HomePageProps) => {

    // ─── Загальні запити (для всіх) ───────────────────────
    const { data: bannersRaw,     isLoading: bannersLoading     } = useGetApiHomeBanners();
    const { data: moodsRaw,       isLoading: moodsLoading       } = useGetApiMoods({ limit: 10 });
    const { data: genresRaw,      isLoading: genresLoading      } = useGetApiGenres({ limit: 10 });
    const { data: topTracksRaw,   isLoading: topTracksLoading   } = useGetApiHomeTopTracks({ limit: 10 });
    const { data: newReleasesRaw, isLoading: newReleasesLoading } = useGetApiHomeNewReleases({ limit: 10 });


    // ─── Топ артисти (для неавторизованих) ───────────────
    const { data: topArtistsRaw, isLoading: topArtistsLoading } = useGetApiHomeTopArtists(
        { limit: 10 },
        {
            query: {
                enabled:  !isAuthenticated,
                queryKey: getGetApiHomeTopArtistsQueryKey({ limit: 10 }),
            },
        }
    );
    // ─── Улюблені артисти (для авторизованих) ────────────
    const { data: followedArtistsRaw, isLoading: followedArtistsLoading } = useGetApiMeFollowingArtists(
        { PageSize: 10 },
        {
            query: {
                enabled:  isAuthenticated,
                queryKey: getGetApiMeFollowingArtistsQueryKey({ PageSize: 10 }),
            },
        }
    );

    // ─── Баннери ──────────────────────────────────────────
    const banners: BannerItem[] = extractList<HomeBannerDto>(bannersRaw)
        .map(b => ({
            id:       b.id        ?? '',
            imageUrl: getImageUrl(b.bannerUrl) ?? '',
            title:    b.title,
            href:     b.targetUrl,
        }))
        .filter(b => b.imageUrl);

    // ─── Настрої / жанри ──────────────────────────────────
    const moods: MoodCardData[] = extractList<MoodItemDto>(moodsRaw).map(m => ({
        id:      m.id   ?? '',
        name:    m.name ?? '',
        iconUrl: getImageUrl(m.coverUrl),

    }));

    const genres: MoodCardData[] = extractList<GenreItemDto>(genresRaw).map(g => ({
        id:      g.id   ?? '',
        name:    g.name ?? '',
        iconUrl: getImageUrl(g.coverUrl),
    }));

    // ─── Топ треки ────────────────────────────────────────
    const topTracks: TrackCardData[] = extractList<TopTrackDto>(topTracksRaw).map(t => ({
        id:          t.id    ?? '',
        title:       t.title ?? '',
        artistNames: (t.artists ?? []).map((a: TrackArtistDto) => a.name ?? ''),
        coverUrl:    getImageUrl(t.coverUrl),
    }));

    // ─── Нові релізи ──────────────────────────────────────
    const newReleases: AlbumCardData[] = extractList<NewReleaseDto>(newReleasesRaw).map(a => ({
        id:          a.id          ?? '',
        title:       a.title       ?? '',
        artistName:  (a.artists ?? []).map((ar: TrackArtistDto) => ar.name ?? '').join(', '),
        tracksCount: a.tracksCount ?? 0,
        coverUrl:    getImageUrl(a.coverUrl),
    }));

    // ─── Артисти — залежно від авторизації ────────────────
    const artists: ArtistCardData[] = isAuthenticated
        ? extractList<FollowedArtistDto>(followedArtistsRaw).map(a => ({
            id:               a.artistId       ?? '',
            name:             a.name           ?? '',
            monthlyListeners: a.followersCount ?? 0,
            avatarUrl:        getImageUrl(a.avatarUrl),
        }))
        : extractList<TopArtistDto>(topArtistsRaw).map(a => ({
            id:               a.id             ?? '',
            name:             a.name           ?? '',
            monthlyListeners: a.followersCount ?? 0,
            avatarUrl:        getImageUrl(a.avatarUrl),
        }));

    const artistsLoading = isAuthenticated ? followedArtistsLoading : topArtistsLoading;


    // ─── Персоналізовані заголовки ────────────────────────
    const moodTitle    = isAuthenticated ? 'Саундтреки на основі твого настрою' : 'Знайди музику за настроєм';
    const tracksTitle  = isAuthenticated ? 'Топ ВАША музика сьогодні!'          : 'Топ популярна музика';
    const artistsTitle = isAuthenticated ? 'Твої улюблені виконавці'             : 'Популярні виконавці';

    return (
        <div className="home-page container-fluid">

            <HeroBannerSection
                items={banners}
                isLoading={bannersLoading}
            />

            <MoodSection
                moods={moods.length > 0 ? moods : undefined}
                genres={genres.length > 0 ? genres : undefined}
                isLoading={moodsLoading || genresLoading}
                title={moodTitle}
            />

            <TopTracksSection
                tracks={topTracks.length > 0 ? topTracks : undefined}
                isLoading={topTracksLoading}
                sectionTitle={tracksTitle}
            />

            <NewReleasesSection
                albums={newReleases.length > 0 ? newReleases : undefined}
                isLoading={newReleasesLoading}
            />

            <FavoriteArtistsSection
                artists={artists.length > 0 ? artists : undefined}
                isLoading={artistsLoading}
                sectionTitle={artistsTitle}
            />

            <AllTracksSection/>

            <div style={{padding: '0 24px'}}>
                {TEST_TRACKS.map(track => (
                    <TrackRow key={track.id} track={track} allTracks={TEST_TRACKS} sourceType="Search"/>
                ))}
            </div>

        </div>
    );
};

