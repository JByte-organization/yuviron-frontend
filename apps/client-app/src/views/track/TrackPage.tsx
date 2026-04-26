'use client';

import React from 'react';
import { TrackPageHeader } from './ui/TrackPageHeader';
import { TrackRecommendationsSection } from './ui/TrackRecommendationsSection';
import { ArtistTopTracksSection } from './ui/ArtistTopTracksSection';
import { NewReleasesSection } from '@/views/home/ui/sections/NewReleasesSection';

interface TrackPageProps {
    trackId: string;
}

// ─── Mock дані ────────────────────────────────────────────
// TODO: замінити на хук — useGetApiTracksId(trackId)
const MOCK_TRACK = {
    id: '1',
    title: 'Rockstar',
    artistId: 'artist-1',
    artistName: 'LISA',
    albumTitle: 'Alter Ego',
    year: '2025',
    durationMs: 166000,
    coverUrl: null,
};

/**
 * Сторінка: Трек
 *
 * Підключення даних:
 * 1. const { data: track, isLoading } = useGetApiTracksId(trackId);
 * 2. Передати дані в TrackPageHeader і дочірні секції
 */
export const TrackPage = ({ trackId }: TrackPageProps) => {
    // TODO: замінити на хук
    const track = MOCK_TRACK;

    return (
        <div className="track-page">
            {/* Хедер треку */}
            <TrackPageHeader
                trackId={track.id}
                title={track.title}
                artistName={track.artistName}
                albumTitle={track.albumTitle}
                year={track.year}
                durationMs={track.durationMs}
                coverUrl={track.coverUrl}
                onPlay={() => console.log('play')}       // TODO: плеєр
                onLike={() => console.log('like')}       // TODO: хук лайку
                onAddToPlaylist={() => console.log('add')} // TODO: модалка
            />

            {/* Рекомендації */}
            <TrackRecommendationsSection />

            {/* Популярні треки виконавця */}
            <ArtistTopTracksSection
                artistId={track.artistId}
                artistName={track.artistName}
            />

            {/* Інші альбоми виконавця */}
            <NewReleasesSection
                sectionTitle={`${track.artistName}: інші альбоми`}
                highlightedWord="інші"
                showAllHref={`/artists/${track.artistId}/albums`}
            />
        </div>
    );
};