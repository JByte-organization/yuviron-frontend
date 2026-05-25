'use client';

import React from 'react';
import {
    useGetApiHomeBanners,
    useGetApiHomeTopTracks,
    useGetApiHomeNewReleases,
    useGetApiHomeTopArtists,
    useGetApiMoods,
    useGetApiGenres,
    type HomeBannerDto,
    type TopTrackDto,
    type TopArtistDto,
    type MoodItemDto,
    type GenreItemDto,
} from '@repo/api';
import { HeroBannerSection } from './ui/sections/HeroBannerSection';
import { MoodSection } from './ui/sections/MoodSection';
import { TopTracksSection } from './ui/sections/TopTracksSection';
import { NewReleasesSection } from './ui/sections/NewReleasesSection';
import { FavoriteArtistsSection } from './ui/sections/FavoriteArtistsSection';
import { getImageUrl } from '@/shared/lib/getImageUrl';
import type { MoodCardData } from '@/entities/mood/ui/MoodCard';
import type { TrackCardData } from '@/entities/track/ui/TrackCard';
import type { AlbumCardData } from '@/entities/album/ui/AlbumCard';
import type { ArtistCardData } from '@/entities/artist/ui/ArtistCard';

interface HomePageProps {
    isAuthenticated?: boolean;
}

// ─── Хелпер для витягування масиву з різних форматів відповіді ──
const extractList = <T,>(raw: unknown): T[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw as T[];
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.data))  return obj.data  as T[];
    if (Array.isArray(obj.items)) return obj.items as T[];
    return [];
};

export const HomePage = ({ isAuthenticated = false }: HomePageProps) => {

    // ─── API запити ───────────────────────────────────────
    const { data: bannersRaw,     isLoading: bannersLoading     } = useGetApiHomeBanners();
    const { data: moodsRaw,       isLoading: moodsLoading       } = useGetApiMoods({ limit: 10 });
    const { data: genresRaw,      isLoading: genresLoading      } = useGetApiGenres({ limit: 10 });
    const { data: topTracksRaw,   isLoading: topTracksLoading   } = useGetApiHomeTopTracks({ limit: 10 });
    const { data: newReleasesRaw, isLoading: newReleasesLoading } = useGetApiHomeNewReleases({ limit: 10 });
    const { data: topArtistsRaw,  isLoading: topArtistsLoading  } = useGetApiHomeTopArtists({ limit: 10 });

    // ─── Трансформація в формат карток ───────────────────
    const moods: MoodCardData[] = extractList<MoodItemDto>(moodsRaw).map(m => ({
        id:      m.id      ?? '',
        name:    m.name    ?? '',
        iconUrl: getImageUrl(m.coverUrl),
    }));

    const genres: MoodCardData[] = extractList<GenreItemDto>(genresRaw).map(g => ({
        id:      g.id      ?? '',
        name:    g.name    ?? '',
        iconUrl: getImageUrl(g.coverUrl),
    }));

    const topTracks: TrackCardData[] = extractList<TopTrackDto>(topTracksRaw).map(t => ({
        id:          t.id    ?? '',
        title:       t.title ?? '',
        artistNames: (t.artists ?? []).map(a => a.name ?? ''),
        coverUrl:    getImageUrl(t.coverUrl),
    }));

    const newReleases: AlbumCardData[] = extractList<{
        id?: string;
        title?: string | null;
        artistName?: string | null;
        artist?: { name?: string | null };
        tracksCount?: number;
        coverUrl?: string | null;
    }>(newReleasesRaw).map(a => ({
        id:          a.id          ?? '',
        title:       a.title       ?? '',
        artistName:  a.artistName  ?? a.artist?.name ?? '',
        tracksCount: a.tracksCount ?? 0,
        coverUrl:    getImageUrl(a.coverUrl),
    }));

    const topArtists: ArtistCardData[] = extractList<TopArtistDto>(topArtistsRaw).map(a => ({
        id:               a.id             ?? '',
        name:             a.name           ?? '',
        monthlyListeners: a.followersCount ?? 0,
        avatarUrl:        getImageUrl(a.avatarUrl),
    }));

    const banners: HomeBannerDto[] = extractList<HomeBannerDto>(bannersRaw);

    // ─── Персоналізовані заголовки ────────────────────────
    const topTracksTitle      = isAuthenticated ? 'Топ ВАША музика сьогодні!'        : 'Топ популярна музика';
    const topTracksHighlight  = isAuthenticated ? 'музика'                            : 'популярна';
    const artistsTitle        = isAuthenticated ? 'Твої улюблені виконавці'           : 'Популярні виконавці';
    const moodTitle           = isAuthenticated ? 'Саундтреки на основі твого настрою': 'Знайди музику за настроєм';

    return (
        <div className="home-page">

            {/* Баннери */}
            <HeroBannerSection
                items={banners}
                isLoading={bannersLoading}
            />

            {/* Настрій / Жанр */}
            <MoodSection
                moods={moods.length   > 0 ? moods   : undefined}
                genres={genres.length > 0 ? genres  : undefined}
                isLoading={moodsLoading || genresLoading}
                title={moodTitle}
            />

            {/* Топ треки */}
            <TopTracksSection
                tracks={topTracks.length > 0 ? topTracks : undefined}
                isLoading={topTracksLoading}
                sectionTitle={topTracksTitle}
                highlightedWord={topTracksHighlight}
            />

            {/* Нові релізи */}
            <NewReleasesSection
                albums={newReleases.length > 0 ? newReleases : undefined}
                isLoading={newReleasesLoading}
            />

            {/* Топ / Улюблені артисти */}
            <FavoriteArtistsSection
                artists={topArtists.length > 0 ? topArtists : undefined}
                isLoading={topArtistsLoading}
                sectionTitle={artistsTitle}
            />

        </div>
    );
};