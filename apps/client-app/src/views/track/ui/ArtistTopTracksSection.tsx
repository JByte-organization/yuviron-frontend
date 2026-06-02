'use client';

import React, { useMemo } from 'react';
import { useGetApiArtistsIdTopTracks } from '@repo/api/client';
import { TrackRow, type TrackRowData } from '@/entities/track/ui/TrackRow';

interface ArtistTopTracksSectionProps {
    artistId: string;
    artistName: string;
}

export const ArtistTopTracksSection = ({ artistId, artistName }: ArtistTopTracksSectionProps) => {
    // Отримуємо топ-5 треків виконавця
    const { data: rawTopTracks, isLoading } = useGetApiArtistsIdTopTracks(artistId, {
        limit: 5
    });

    const mappedTracks = useMemo<TrackRowData[]>(() => {
        const unwrapped = (rawTopTracks as any)?.data ?? rawTopTracks;
        const list = Array.isArray(unwrapped) ? unwrapped : [];

        return list.map((track, index) => ({
            id:          track.id ?? '',
            index:       index + 1,
            title:       track.title ?? 'Без назви',
            artistNames: [artistName],
            artistId,
            albumId:     track.album?.id,
            albumTitle:  track.album?.title ?? '—',
            addedAt:     null,
            durationMs:  track.durationMs ?? (track.durationSeconds ? track.durationSeconds * 1000 : null),
            coverUrl:    track.coverUrl,
            playsCount:  track.playsCount ?? 0, // Поле відобразиться, бо варіант "artist"
            isLiked:     track.isLiked ?? false,
        }));
    }, [rawTopTracks, artistId, artistName]);

    return (
        <section className="mb-5">
            <div className="mb-3">
                <h2 className="section-header__title" style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{artistName}</h2>
                <p className="track-page__subtitle text-secondary m-0 small">Популярні треки цього виконавця</p>
            </div>

            {isLoading ? (
                <div className="d-flex flex-column gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-white-5 rounded" style={{ height: 56, width: '100%' }} />
                    ))}
                </div>
            ) : mappedTracks.length === 0 ? (
                <p className="text-secondary small">У виконавця немає популярних треків</p>
            ) : (
                <div className="d-flex flex-column gap-1">
                    {mappedTracks.map((track) => (
                        <TrackRow
                            key={track.id}
                            track={track}
                            allTracks={mappedTracks}
                            variant="artist"
                            sourceType="ArtistProfile"
                            sourceId={artistId}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};