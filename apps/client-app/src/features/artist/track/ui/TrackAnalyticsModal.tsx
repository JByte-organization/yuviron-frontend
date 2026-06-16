'use client';

import React, { useState } from 'react';
import {
    AreaChart, Area, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Modal } from '@/shared/ui/Modal';
import { useCurrentArtistId } from '@/entities/artist/model/currentArtist';
import {
    useTrackPlaysOverTime,
    useTrackRetention,
} from '@/entities/artist/api/analytics';
import {
    CHART_COLORS,
    ChartError,
    ChartSkeleton,
    chartTooltipStyle,
    useChartAxisColors,
} from '@/entities/artist/ui/AnalyticsChartParts';

interface Props {
    isOpen: boolean;
    trackId: string;
    trackTitle: string;
    onClose: () => void;
}

const PERIODS = [7, 30, 90] as const;
type PeriodDays = (typeof PERIODS)[number];

const formatSecond = (second: number): string => {
    const minutes = Math.floor(second / 60);
    const seconds = second % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

export const TrackAnalyticsModal = ({ isOpen, trackId, trackTitle, onClose }: Props) => {
    const artistId = useCurrentArtistId();
    const [days, setDays] = useState<PeriodDays>(30);

    const retentionQuery = useTrackRetention(isOpen ? trackId : undefined, artistId);
    const playsQuery = useTrackPlaysOverTime(isOpen ? trackId : undefined, artistId, days);

    const chart = useChartAxisColors();

    const retention = retentionQuery.data ?? [];
    const playsData = (playsQuery.data ?? []).map(point => ({
        ...point,
        label: format(parseISO(point.date), 'dd MMM', { locale: uk }),
    }));

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Аналітика: ${trackTitle}`} size="lg">

            <div className="mb-4">
                <h3 className="artist-analytics-page__chart-title mb-3">Утримання аудиторії</h3>
                {retentionQuery.isLoading ? (
                    <ChartSkeleton height={220} />
                ) : retentionQuery.isError ? (
                    <ChartError error={retentionQuery.error} />
                ) : retention.length === 0 ? (
                    <div className="text-secondary py-4 text-center">
                        Ще немає даних про утримання — трек мають почати слухати.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={retention} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                            <defs>
                                <linearGradient id="retentionFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%"   stopColor={CHART_COLORS.accent} stopOpacity={0.35} />
                                    <stop offset="100%" stopColor={CHART_COLORS.accent} stopOpacity={0.02} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                            <XAxis
                                dataKey="second"
                                tickFormatter={formatSecond}
                                tick={{ fill: chart.text, fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                domain={[0, 100]}
                                tickFormatter={v => `${v}%`}
                                tick={{ fill: chart.text, fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                {...chartTooltipStyle}
                                labelFormatter={(second) => `Секунда ${formatSecond(Number(second))}`}
                                formatter={(value, name) =>
                                    name === 'retentionPercent'
                                        ? [`${Number(value).toFixed(2)}%`, 'Утримання']
                                        : [Number(value).toLocaleString('uk-UA'), 'Прослуховувань']}
                            />
                            <Area
                                type="monotone"
                                dataKey="retentionPercent"
                                stroke={CHART_COLORS.accent}
                                strokeWidth={2.5}
                                fill="url(#retentionFill)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            <div className="d-flex align-items-center justify-content-between mb-3">
                <h3 className="artist-analytics-page__chart-title m-0">Прослуховування</h3>
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
            {playsQuery.isLoading ? (
                <ChartSkeleton height={220} />
            ) : playsQuery.isError ? (
                <ChartError error={playsQuery.error} />
            ) : playsData.length === 0 ? (
                <div className="text-secondary py-4 text-center">
                    Поки немає прослуховувань за обраний період.
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={playsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                        <XAxis dataKey="label" tick={{ fill: chart.text, fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: chart.text, fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip {...chartTooltipStyle} />
                        <Legend wrapperStyle={{ fontSize: 13 }} />
                        <Line
                            type="monotone"
                            dataKey="totalPlays"
                            name="Усього"
                            stroke={CHART_COLORS.accent}
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={{ r: 5, fill: CHART_COLORS.accent }}
                        />
                        <Line
                            type="monotone"
                            dataKey="uniqueListeners"
                            name="Унікальних слухачів"
                            stroke={CHART_COLORS.accent2}
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={{ r: 5, fill: CHART_COLORS.accent2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </Modal>
    );
};
