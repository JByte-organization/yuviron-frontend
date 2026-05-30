'use client';

import React, { useState } from 'react';
import { useGetApiHomeTopTracks, type TopTrackDto, type TrackArtistDto } from '@repo/api';
import { TrackRow, type TrackRowData } from '@/entities/track/ui/TrackRow';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { getImageUrl } from '@/shared/lib/getImageUrl';

export const AllTracksSection = () => {
    const [showAll, setShowAll] = useState(false);

    const { data: raw, isLoading } = useGetApiHomeTopTracks({ limit: 50 });

    const tracks: TrackRowData[] = (Array.isArray(raw) ? raw : (raw as any)?.data ?? [])
        .map((t: TopTrackDto, i: number) => ({
            id:          t.id    ?? '',
            index:       i + 1,
            title:       t.title ?? '',
            artistNames: (t.artists ?? []).map((a: TrackArtistDto) => a.name ?? ''),
            artistId:    (t.artists ?? [])[0]?.id ?? undefined,
            coverUrl:    getImageUrl(t.coverUrl),
            durationMs:  null,
            addedAt:     null,
        }));

    const visible = showAll ? tracks : tracks.slice(0, 10);

    console.log('[AllTracksSection] raw:', raw);

    if (!isLoading && tracks.length === 0) return null;

    return (
        <section className="mb-5">
            <SectionHeader
                title="Всі треки"
                highlightedWord="треки"
            />

            {/* Заголовки колонок */}
            <div className="track-list-header">
                <div className="track-list-header__index">#</div>
                <div className="track-list-header__title">Назва</div>
                <div className="track-list-header__album d-none d-md-block">Альбом</div>
                <div className="track-list-header__duration">
                    <i className="bi bi-clock" />
                </div>
            </div>
            <hr className="track-list-header__divider" />

            {isLoading ? (
                <div className="d-flex flex-column gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="d-flex align-items-center gap-3 py-2">
                            <div className="skeleton" style={{ width: 20, height: 16 }} />
                            <div className="skeleton" style={{ width: 40, height: 40 }} />
                            <div>
                                <div className="skeleton mb-1" style={{ width: 160, height: 14 }} />
                                <div className="skeleton" style={{ width: 100, height: 12 }} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {visible.map(track => (
                        <TrackRow
                            key={track.id}
                            track={track}
                            allTracks={tracks}
                            sourceType="Search"
                            sourceId={null}
                        />
                    ))}

                    {tracks.length > 10 && (
                        <button
                            className="all-tracks-section__show-more"
                            onClick={() => setShowAll(v => !v)}
                        >
                            {showAll ? 'Показати менше' : `Показати всі ${tracks.length} треків`}
                        </button>
                    )}
                </>
            )}
        </section>
    );
};