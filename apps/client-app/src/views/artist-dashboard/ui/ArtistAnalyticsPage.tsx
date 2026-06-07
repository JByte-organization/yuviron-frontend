'use client';

import React from 'react';
import Image from 'next/image';
import {
    getGetApiStudioArtistStatsQueryKey,
    useGetApiStudioArtistStats,
    type ArtistAnalyticsDto,
} from '@repo/api/artist.ts';
import { useCurrentArtistId } from '@/entities/artist/model/currentArtist';
import { getImageUrl } from '@/shared/lib/getImageUrl';

const unwrap = <T,>(raw: unknown): T | undefined => {
    if (!raw) return undefined;
    const obj = raw as { data?: T };
    return (obj.data ?? (raw as T)) as T;
};

// Бек віддає лише агрегати (ArtistAnalyticsDto: totalPlays, monthlyListeners,
// totalTracks, totalAlbums, topTrack). Часових рядів НЕМАЄ, тому графіки
// (тиждень/місяць/рік, ріст підписників, джерела) прибрані зі сторінки —
// демо-дані в кабінеті лише вводили артиста в оману. Коли бекенд додасть
// time-series ендпоінти — повернути recharts-блоки з історії git (SCRUM-241).
export const ArtistAnalyticsPage = () => {
    const artistId = useCurrentArtistId();
    const statsParams = { artistId: artistId ?? undefined };
    const { data: statsRaw } = useGetApiStudioArtistStats(statsParams, {
        query: { enabled: !!artistId, queryKey: getGetApiStudioArtistStatsQueryKey(statsParams) },
    });
    const stats = unwrap<ArtistAnalyticsDto>(statsRaw);
    const topTrack = stats?.topTrack;
    const topTrackCover = getImageUrl(topTrack?.coverUrl);

    return (
        <div className="artist-analytics-page">

            {/* ─── Заголовок ────────────────────────── */}
            <div className="artist-analytics-page__header">
                <h1 className="artist-analytics-page__title">Статистика</h1>
            </div>

            {/* ─── Summary cards ─────────────────────── */}
            <div className="row g-3 mb-5">
                {[
                    { label: 'Прослуховувань',  value: Number(stats?.totalPlays ?? 0).toLocaleString('uk-UA'), icon: 'bi-headphones',    color: '#00A6FF' },
                    { label: 'Слухачів/міс',    value: (stats?.monthlyListeners ?? 0).toLocaleString('uk-UA'), icon: 'bi-people',        color: '#7B61FF' },
                    { label: 'Треків',          value: stats?.totalTracks ?? 0,                                icon: 'bi-music-note',    color: '#FF6B6B' },
                    { label: 'Альбомів',        value: stats?.totalAlbums ?? 0,                                icon: 'bi-collection',    color: '#2ECC71' },
                ].map(card => (
                    <div key={card.label} className="col-6 col-lg-3">
                        <div className="artist-analytics-page__card">
                            <div className="artist-analytics-page__card-icon" style={{ color: card.color }}>
                                <i className={`bi ${card.icon}`} />
                            </div>
                            <div className="artist-analytics-page__card-value">{card.value}</div>
                            <div className="artist-analytics-page__card-label">{card.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ─── Топ трек ──────────────────────────── */}
            {topTrack && (
                <div className="artist-analytics-page__chart-block">
                    <h2 className="artist-analytics-page__chart-title">Топ трек</h2>
                    <div className="d-flex flex-column gap-3 mt-3">
                        <div className="artist-analytics-page__top-track">
                            <span className="artist-analytics-page__top-track-num">1</span>
                            {topTrackCover && (
                                <Image
                                    src={topTrackCover}
                                    alt={topTrack.title ?? 'Топ трек'}
                                    width={40}
                                    height={40}
                                    style={{ borderRadius: 6, objectFit: 'cover' }}
                                    unoptimized
                                />
                            )}
                            <span className="artist-analytics-page__top-track-title">
                                {topTrack.title ?? 'Без назви'}
                            </span>
                            <div className="artist-analytics-page__top-track-bar-wrap">
                                <div
                                    className="artist-analytics-page__top-track-bar"
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <span className="artist-analytics-page__top-track-plays">
                                {(topTrack.playCount ?? 0).toLocaleString('uk-UA')}
                            </span>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
