'use client';

import React, { useMemo } from 'react';
import { useGetApiArtistsIdTopTracks, type ArtistTopTrackDto } from '@repo/api/client';
import { TrackRow, type TrackRowData } from '@/entities/track/ui/TrackRow';

interface ArtistTopTracksSectionProps {
    artistId: string;
    artistName: string;
}

// Вспомогательная функция развертывания списков из Orval
const extractList = <T,>(raw: unknown): T[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw as T[];
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.data))  return obj.data  as T[];
    if (Array.isArray(obj.items)) return obj.items as T[];
    return [];
};

export const ArtistTopTracksSection = ({ artistId, artistName }: ArtistTopTracksSectionProps) => {
    // Отримуємо топ-5 треків виконавця
    const { data: rawTopTracks, isLoading } = useGetApiArtistsIdTopTracks(artistId, {
        limit: 5
    });

    const mappedTracks = useMemo<TrackRowData[]>(() => {
        const list = extractList<ArtistTopTrackDto>(rawTopTracks);

        return list.map((track, index) => {
            // Динамически собираем имена всех артистов трека (с учетом фитов)
            const artists = track.artists && track.artists.length > 0
                ? track.artists.map(a => a.name ?? '').filter(Boolean)
                : [artistName];

            return {
                id:          track.id ?? '',
                index:       index + 1,
                title:       track.title ?? 'Без назви',
                artistNames: artists,
                artistId,
                albumId:     track.albumId,
                albumTitle:  track.albumTitle ?? '—',
                addedAt:     null,
                durationMs:  track.durationMs ?? null,
                coverUrl:    track.coverUrl,
                playsCount:  track.playCount ?? 0,
                //isLiked:     track.isLiked ?? false,
            };
        });
    }, [rawTopTracks, artistId, artistName]);

    return (
        <section className="artist-top-tracks mb-5">
            <div className="mb-3">
                <h2 className="section-header__title" style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Популярні треки</h2>
                <p className="track-page__subtitle text-secondary m-0 small">Найбільш прослуховувані роботи виконавця</p>
            </div>

            {isLoading ? (
                <div className="d-flex flex-column gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="bg-white-5 rounded skeleton" style={{ height: 56, width: '100%' }} />
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
                            variant="artist" // Включает отображение счетчика прослушиваний вместо даты
                            sourceType="ArtistProfile"
                            sourceId={artistId}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};