'use client';

import React, { useState } from 'react';
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { useTheme } from '@/shared/lib/ThemeProvider';
import {
    getGetApiStudioArtistStatsQueryKey,
    useGetApiStudioArtistStats,
    type ArtistAnalyticsDto,
} from '@repo/api/artist.ts';
import { useCurrentArtistId } from '@/entities/artist/model/currentArtist';

const unwrap = <T,>(raw: unknown): T | undefined => {
    if (!raw) return undefined;
    const obj = raw as { data?: T };
    return (obj.data ?? (raw as T)) as T;
};

// ─── Mock: бек віддає лише агрегати (ArtistAnalyticsDto), без часових рядів.
// Графіки нижче (тиждень/місяць/рік, ріст підписників, джерела) і топ-5 —
// демо-дані, доки бекенд не додасть відповідні ендпоінти. Summary-картки — реальні.
// ───────────────────────────────────────────────────────────
const PLAYS_WEEKLY = [
    { day: 'Пн', plays: 120 }, { day: 'Вт', plays: 240 },
    { day: 'Ср', plays: 180 }, { day: 'Чт', plays: 310 },
    { day: 'Пт', plays: 290 }, { day: 'Сб', plays: 450 },
    { day: 'Нд', plays: 380 },
];

const PLAYS_MONTHLY = Array.from({ length: 30 }, (_, i) => ({
    day: `${i + 1}`,
    plays: Math.floor(Math.random() * 400 + 100),
}));

const PLAYS_YEARLY = [
    { month: 'Січ', plays: 3200 }, { month: 'Лют', plays: 4100 },
    { month: 'Бер', plays: 3800 }, { month: 'Квіт', plays: 5200 },
    { month: 'Трав', plays: 4700 }, { month: 'Черв', plays: 6100 },
    { month: 'Лип', plays: 5800 }, { month: 'Серп', plays: 7200 },
    { month: 'Вер', plays: 6600 }, { month: 'Жовт', plays: 7800 },
    { month: 'Лист', plays: 8200 }, { month: 'Груд', plays: 9100 },
];

const TOP_TRACKS = [
    { title: 'THE CONTORTIONIST', plays: 1025, percent: 35 },
    { title: 'Глубоко',           plays: 656,  percent: 22 },
    { title: 'Superman',          plays: 520,  percent: 18 },
    { title: 'Sweater Weather',   plays: 480,  percent: 16 },
    { title: 'Cry Me A River',    plays: 235,  percent: 9  },
];

const FOLLOWERS_DATA = [
    { month: 'Бер', followers: 12 }, { month: 'Квіт', followers: 19 },
    { month: 'Трав', followers: 28 }, { month: 'Черв', followers: 35 },
    { month: 'Лип',  followers: 42 }, { month: 'Серп', followers: 56 },
];

const SOURCES_DATA = [
    { name: 'Пошук',          value: 40, color: '#00A6FF' },
    { name: 'Плейлісти',      value: 25, color: '#7B61FF' },
    { name: 'Профіль артиста',value: 20, color: '#FF6B6B' },
    { name: 'Інше',           value: 15, color: '#FFB347' },
];

type Period = 'week' | 'month' | 'year';

// Акцентные цвета серий графиков (data-viz, не зависят от темы).
const COLORS = {
    accent:  '#00A6FF',
    accent2: '#7B61FF',
};

export const ArtistAnalyticsPage = () => {
    const [period, setPeriod] = useState<Period>('week');

    const artistId = useCurrentArtistId();
    const statsParams = { artistId: artistId ?? undefined };
    const { data: statsRaw } = useGetApiStudioArtistStats(statsParams, {
        query: { enabled: !!artistId, queryKey: getGetApiStudioArtistStatsQueryKey(statsParams) },
    });
    const stats = unwrap<ArtistAnalyticsDto>(statsRaw);

    // Цвета осей/сетки графиков рисуются как SVG-атрибуты, где var() не резолвится,
    // поэтому подбираем их под активную тему вручную.
    const { theme } = useTheme();
    const chart = theme === 'light'
        ? { grid: 'rgba(15,23,36,0.12)',     text: 'rgba(13,21,32,0.6)' }
        : { grid: 'rgba(119,145,178,0.15)',  text: 'rgba(206,216,227,0.55)' };

    const playsData = period === 'week'
        ? PLAYS_WEEKLY.map(d => ({ label: d.day,   value: d.plays }))
        : period === 'month'
            ? PLAYS_MONTHLY.map(d => ({ label: d.day,  value: d.plays }))
            : PLAYS_YEARLY.map(d =>  ({ label: d.month, value: d.plays }));

    return (
        <div className="artist-analytics-page">

            {/* ─── Заголовок ────────────────────────── */}
            <div className="artist-analytics-page__header">
                <h1 className="artist-analytics-page__title">Статистика</h1>

                {/* Перемикач periodу */}
                <div className="artist-analytics-page__period-tabs">
                    {(['week', 'month', 'year'] as Period[]).map(p => (
                        <button
                            key={p}
                            className={`artist-analytics-page__period-btn${period === p ? ' artist-analytics-page__period-btn--active' : ''}`}
                            onClick={() => setPeriod(p)}
                        >
                            {{ week: 'Тиждень', month: 'Місяць', year: 'Рік' }[p]}
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

            {/* ─── Графік прослуховувань ─────────────── */}
            <div className="artist-analytics-page__chart-block mb-5">
                <h2 className="artist-analytics-page__chart-title">Прослуховування</h2>
                <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={playsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                        <XAxis dataKey="label" tick={{ fill: chart.text, fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: chart.text, fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                            contentStyle={{ background: 'var(--client-surface)', border: '1px solid var(--client-border)', borderRadius: 8 }}
                            labelStyle={{ color: 'var(--client-text)' }}
                            itemStyle={{ color: COLORS.accent }}
                        />
                        <Line
                            type="monotone"
                            dataKey="value"
                            name="Прослуховувань"
                            stroke={COLORS.accent}
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={{ r: 5, fill: COLORS.accent }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="row g-4 mb-5">
                {/* ─── Топ треки ──────────────────────── */}
                <div className="col-12 col-lg-7">
                    <div className="artist-analytics-page__chart-block h-100">
                        <h2 className="artist-analytics-page__chart-title">Топ треки</h2>
                        <div className="d-flex flex-column gap-3 mt-3">
                            {TOP_TRACKS.map((track, i) => (
                                <div key={track.title} className="artist-analytics-page__top-track">
                                    <span className="artist-analytics-page__top-track-num">{i + 1}</span>
                                    <span className="artist-analytics-page__top-track-title">{track.title}</span>
                                    <div className="artist-analytics-page__top-track-bar-wrap">
                                        <div
                                            className="artist-analytics-page__top-track-bar"
                                            style={{ width: `${track.percent}%` }}
                                        />
                                    </div>
                                    <span className="artist-analytics-page__top-track-plays">
                                        {track.plays.toLocaleString('uk-UA')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ─── Джерела прослуховувань ─────────── */}
                <div className="col-12 col-lg-5">
                    <div className="artist-analytics-page__chart-block h-100">
                        <h2 className="artist-analytics-page__chart-title">Джерела</h2>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={SOURCES_DATA}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={80}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {SOURCES_DATA.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: 'var(--client-surface)', border: '1px solid var(--client-border)', borderRadius: 8 }}
                                    formatter={(value) => [`${value}%`, '']}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="artist-analytics-page__legend">
                            {SOURCES_DATA.map(s => (
                                <div key={s.name} className="artist-analytics-page__legend-item">
                                    <span className="artist-analytics-page__legend-dot" style={{ background: s.color }} />
                                    <span>{s.name}</span>
                                    <span className="ms-auto">{s.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Зростання підписників ─────────────── */}
            <div className="artist-analytics-page__chart-block">
                <h2 className="artist-analytics-page__chart-title">Зростання підписників</h2>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={FOLLOWERS_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                        <XAxis dataKey="month" tick={{ fill: chart.text, fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: chart.text, fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                            contentStyle={{ background: 'var(--client-surface)', border: '1px solid var(--client-border)', borderRadius: 8 }}
                            labelStyle={{ color: 'var(--client-text)' }}
                            itemStyle={{ color: COLORS.accent2 }}
                        />
                        <Bar dataKey="followers" name="Підписників" fill={COLORS.accent2} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

        </div>
    );
};