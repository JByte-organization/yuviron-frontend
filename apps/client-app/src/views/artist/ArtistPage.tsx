'use client';

import React from 'react';
import { ArtistPageHeader } from './ui/ArtistPageHeader';
import { ArtistMusicSection } from './ui/ArtistMusicSection';
import { ArtistRelatedTracksSection } from './ui/ArtistRelatedTracksSection';
import { ArtistSimilarArtistsSection } from './ui/ArtistSimilarArtistsSection';
import { ArtistPlaylistsSection } from './ui/ArtistPlaylistsSection';
import { ArtistAboutSection } from './ui/ArtistAboutSection';
import { ArtistTopTracksSection } from '@/views/track/ui/ArtistTopTracksSection';

interface ArtistPageProps {
    artistId: string;
}

// ─── Mock дані ────────────────────────────────────────────
// TODO: замінити на хук — useGetApiArtistsId(artistId)
const MOCK_ARTIST = {
    id: 'blackpink',
    name: 'Blackpink',
    avatarUrl: null,
    isVerified: true,
    monthlyListeners: 75247295,
    bio: 'Південнокорейська група Blackpink — це чотири юні струнні дівчата з дивовижними голосами, красиво рухаються під сучасну музику. Колективна, підібрані басові, басові для лице, однині досягають успіху й набувають слованої слави.',
    bannerUrl: null,
};

/**
 * Сторінка: Артист /artists/{id}
 *
 * Підключення даних:
 * 1. const { data: artist, isLoading } = useGetApiArtistsId(artistId);
 * 2. Передати дані в компоненти
 */
export const ArtistPage = ({ artistId }: ArtistPageProps) => {
    const artist = MOCK_ARTIST;

    return (
        <div className="artist-page">
            {/* Хедер артиста */}
            <ArtistPageHeader
                artistId={artist.id}
                name={artist.name}
                avatarUrl={artist.avatarUrl}
                isVerified={artist.isVerified}
                monthlyListeners={artist.monthlyListeners}
                onPlay={() => console.log('play')}   // TODO: плеєр
                onFollow={() => console.log('follow')} // TODO: хук
            />

            {/* Популярні треки */}
            <ArtistTopTracksSection
                artistId={artistId}
                artistName={artist.name}
                // TODO: useGetApiArtistsIdTopTracks(artistId)
            />

            {/* Музика — таби */}
            <ArtistMusicSection
                artistId={artistId}
                artistName={artist.name}
                // TODO: передати дані з хуків
            />

            {/* Вас може зацікавити */}
            <ArtistRelatedTracksSection
                artistId={artistId}
                // TODO: useGetApiArtistsIdRelatedTracks(artistId)
            />

            {/* Шанувальникам також подобаються */}
            <ArtistSimilarArtistsSection
                artistId={artistId}
                // TODO: useGetApiArtistsIdSimilarArtists(artistId)
            />

            {/* Плейлісти виконавця */}
            <ArtistPlaylistsSection
                artistId={artistId}
                artistName={artist.name}
                // TODO: useGetApiArtistsIdPlaylists(artistId)
            />

            {/* Про виконавця */}
            <ArtistAboutSection
                artistId={artistId}
                monthlyListeners={artist.monthlyListeners}
                bio={artist.bio}
                bannerUrl={artist.bannerUrl}
            />
        </div>
    );
};