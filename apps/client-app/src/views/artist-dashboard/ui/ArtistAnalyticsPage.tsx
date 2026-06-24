'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
    LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { uk } from 'date-fns/locale';
import {
    getGetApiStudioArtistStatsQueryKey,
    useGetApiStudioArtistStats,
    type ArtistAnalyticsDto,
} from '@repo/api/artist.ts';
import { useCurrentArtistId } from '@/entities/artist/model/currentArtist';
import {
    useArtistAudience,
    useArtistPlaysOverTime,
} from '@/entities/artist/api/analytics';
import {
    CHART_COLORS as COLORS,
    ChartError,
    ChartSkeleton,
    chartTooltipStyle,
    useChartAxisColors,
} from '@/entities/artist/ui/AnalyticsChartParts';
import { getImageUrl } from '@/shared/lib/getImageUrl';
import { unwrap } from '@/shared/lib/unwrapApi';

const DEVICE_COLORS = ['#00A6FF', '#7B61FF', '#FF6B6B', '#FFB347', '#2ECC71', '#9AA7B8'];

const PERIODS = [7, 30, 90] as const;
type PeriodDays = (typeof PERIODS)[number];

/** 'UA' → 'Україна' (локалізовано). Невідомий код повертаємо як є. */
const countryName = (() => {
    const names = typeof Intl !== 'undefined'
        ? new Intl.DisplayNames(['uk'], { type: 'region' })
        : null;
    return (code: string): string => {
        try {
            return names?.of(code.toUpperCase()) ?? code;
        } catch {
            return code;
        }
    };
})();

const DEVICE_LABELS: Record<string, string> = {
    WebPlayer:    'Веб-плеєр',
    IosApp:       'iOS',
    AndroidApp:   'Android',
    DesktopApp:   'Десктоп',
    SmartSpeaker: 'Смарт-колонка',
    Mobile:       'Мобільний',
    Desktop:      'Десктоп',
    Unknown:      'Інше',
};

export const ArtistAnalyticsPage = () => {
    const [days, setDays] = useState<PeriodDays>(30);

    const artistId = useCurrentArtistId();
    const statsParams = { artistId: artistId ?? undefined };
    const { data: statsRaw } = useGetApiStudioArtistStats(statsParams, {
        query: { enabled: !!artistId, queryKey: getGetApiStudioArtistStatsQueryKey(statsParams) },
    });
    const stats = unwrap<ArtistAnalyticsDto>(statsRaw);
    const topTrack = stats?.topTrack;
    const topTrackCover = getImageUrl(topTrack?.coverUrl);

    const playsQuery = useArtistPlaysOverTime(artistId, days);
    const audienceQuery = useArtistAudience(artistId, days);

    const chart = useChartAxisColors();
    const tooltipStyle = chartTooltipStyle;

    const playsData = (playsQuery.data ?? []).map(point => ({
        ...point,
        label: format(parseISO(point.date), 'dd MMM', { locale: uk }),
    }));

    const countries = audienceQuery.data?.topCountries ?? [];
    const maxListeners = Math.max(...countries.map(c => c.listeners), 1);
    const devices = (audienceQuery.data?.devices ?? []).map((d, i) => ({
        name: DEVICE_LABELS[d.deviceType] ?? d.deviceType,
        value: d.plays,
        color: DEVICE_COLORS[i % DEVICE_COLORS.length]!,
    }));
    const totalDevicePlays = devices.reduce((sum, d) => sum + d.value, 0);

    return (
        <div className="artist-analytics-page">

            <div className="artist-analytics-page__header">
                <h1 className="artist-analytics-page__title">Статистика</h1>

                <div className="artist-analytics-page__period-tabs">
                    {PERIODS.map(p => (
                        <button
                            key={p}
                            className={`artist-analytics-page__period-btn${days === p ? ' artist-analytics-page__period-btn--active' : ''}`}
                            onClick={() => setDays(p)}
                        >
                            {p} днів
                        </button>
                    ))}
                </div>
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

            <div className="artist-analytics-page__chart-block mb-5">
                <h2 className="artist-analytics-page__chart-title">Прослуховування</h2>
                {playsQuery.isLoading ? (
                    <ChartSkeleton />
                ) : playsQuery.isError ? (
                    <ChartError error={playsQuery.error} />
                ) : playsData.length === 0 ? (
                    <div className="text-secondary py-4 text-center">
                        Поки немає прослуховувань за обраний період.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={playsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                            <XAxis dataKey="label" tick={{ fill: chart.text, fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: chart.text, fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip {...tooltipStyle} />
                            <Legend wrapperStyle={{ fontSize: 13 }} />
                            <Line
                                type="monotone"
                                dataKey="totalPlays"
                                name="Усього"
                                stroke={COLORS.accent}
                                strokeWidth={2.5}
                                dot={false}
                                activeDot={{ r: 5, fill: COLORS.accent }}
                            />
                            <Line
                                type="monotone"
                                dataKey="uniqueListeners"
                                name="Унікальних слухачів"
                                stroke={COLORS.accent2}
                                strokeWidth={2.5}
                                dot={false}
                                activeDot={{ r: 5, fill: COLORS.accent2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            <div className="row g-4 mb-5">
                <div className="col-12 col-lg-7">
                    <div className="artist-analytics-page__chart-block h-100">
                        <h2 className="artist-analytics-page__chart-title">Топ країни</h2>
                        {audienceQuery.isLoading ? (
                            <ChartSkeleton height={200} />
                        ) : audienceQuery.isError ? (
                            <ChartError error={audienceQuery.error} />
                        ) : countries.length === 0 ? (
                            <div className="text-secondary py-4 text-center">
                                Ще немає даних про географію слухачів.
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-3 mt-3">
                                {countries.map((country, i) => (
                                    <div key={country.countryCode} className="artist-analytics-page__top-track">
                                        <span className="artist-analytics-page__top-track-num">{i + 1}</span>
                                        <span className="artist-analytics-page__top-track-title">
                                            {countryName(country.countryCode)}
                                        </span>
                                        <div className="artist-analytics-page__top-track-bar-wrap">
                                            <div
                                                className="artist-analytics-page__top-track-bar"
                                                style={{ width: `${(country.listeners / maxListeners) * 100}%` }}
                                            />
                                        </div>
                                        <span className="artist-analytics-page__top-track-plays">
                                            {country.listeners.toLocaleString('uk-UA')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="col-12 col-lg-5">
                    <div className="artist-analytics-page__chart-block h-100">
                        <h2 className="artist-analytics-page__chart-title">Пристрої</h2>
                        {audienceQuery.isLoading ? (
                            <ChartSkeleton height={200} />
                        ) : audienceQuery.isError ? (
                            <ChartError error={audienceQuery.error} />
                        ) : devices.length === 0 ? (
                            <div className="text-secondary py-4 text-center">
                                Ще немає даних про пристрої.
                            </div>
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={devices}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={80}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {devices.map((entry, index) => (
                                                <Cell key={index} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            {...tooltipStyle}
                                            formatter={(value) => [
                                                Number(value).toLocaleString('uk-UA'),
                                                'Прослуховувань',
                                            ]}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="artist-analytics-page__legend">
                                    {devices.map(device => (
                                        <div key={device.name} className="artist-analytics-page__legend-item">
                                            <span className="artist-analytics-page__legend-dot" style={{ background: device.color }} />
                                            <span>{device.name}</span>
                                            <span className="ms-auto">
                                                {totalDevicePlays
                                                    ? `${Math.round((device.value / totalDevicePlays) * 100)}%`
                                                    : '0%'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

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
