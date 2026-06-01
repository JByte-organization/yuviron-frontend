'use client';

import React, { useState } from 'react';
import { FavoritesHeader } from './ui/FavoritesHeader';
import { TrackRow, type TrackRowData } from '@/entities/track/ui/TrackRow';
import { useGetApiMeFavoritesTracks, type UserFavoriteTrackDto, type TrackArtistDto } from '@repo/api';
import { getImageUrl } from '@/shared/lib/getImageUrl';
import {UserFavoriteTrackDtoPaginatedList} from "@repo/api/generated/client/models";

export const FavoritesPage = () => {
    const [currentTrack, setCurrentTrack] = useState<string | null>(null);

    const { data: favoritesRaw, isLoading } = useGetApiMeFavoritesTracks({
        PageSize: 100,
    });

    const paginated = favoritesRaw as UserFavoriteTrackDtoPaginatedList | undefined;
    const items = paginated?.items ?? [];

    const tracks: TrackRowData[] = items.map((t: UserFavoriteTrackDto, i: number) => ({
        id:          t.trackId   ?? '',
        index:       i + 1,
        title:       t.title     ?? '',
        artistNames: (t.artistNames ?? []).map((a: TrackArtistDto) => a.name ?? ''),
        albumId:     t.albumId,
        albumTitle:  t.albumTitle,
        addedAt:     t.savedAt,
        durationMs:  t.durationMs,
        coverUrl:    getImageUrl(t.coverUrl),
    }));

    // console.log('[FavoritesPage] favoritesRaw:', favoritesRaw);

    return (
        <div className="favorites-page">
            <FavoritesHeader tracksCount={tracks.length} />

            <div className="favorites-page__list">
                {isLoading ? (
                    <FavoritesSkeleton />
                ) : tracks.length === 0 ? (
                    <div className="favorites-page__empty">
                        <i className="bi bi-heart" />
                        <p>Улюблених треків поки немає</p>
                    </div>
                ) : (
                    tracks.map(track => (
                        <TrackRow
                            key={track.id}
                            track={track}
                            isPlaying={currentTrack === track.id}
                            onClick={id => setCurrentTrack(id === currentTrack ? null : id)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

const FavoritesSkeleton = () => (
    <>
        {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="track-row">
                <div className="skeleton" style={{ width: 20, height: 16 }} />
                <div className="d-flex align-items-center gap-3 flex-grow-1">
                    <div className="skeleton" style={{ width: 40, height: 40, flexShrink: 0 }} />
                    <div>
                        <div className="skeleton mb-1" style={{ width: 140, height: 14 }} />
                        <div className="skeleton" style={{ width: 100, height: 12 }} />
                    </div>
                </div>
                <div className="skeleton d-none d-md-block" style={{ width: 120, height: 14 }} />
                <div className="skeleton d-none d-lg-block" style={{ width: 80, height: 14 }} />
                <div className="skeleton" style={{ width: 40, height: 14 }} />
            </div>
        ))}
    </>
);