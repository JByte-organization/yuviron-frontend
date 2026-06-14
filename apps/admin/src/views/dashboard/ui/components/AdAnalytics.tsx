'use client';

import React, { useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';
import { formatNumber } from '@/shared/lib/formatNumber';

export interface AdAnalyticsPointDto {
    date?: string | null;
    impressions?: number;
    clicks?: number;
}

interface AdAnalyticsProps {
    adAnalytics: AdAnalyticsPointDto[];
}

const formatDate = (dateString?: string | null): string => {
    if (!dateString || dateString.trim() === '' || dateString.startsWith('0001')) {
        return '—';
    }
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '—';

        return date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return '—';
    }
};

export const AdAnalytics = ({ adAnalytics }: AdAnalyticsProps) => {
    const chartData = useMemo(() => {
        return adAnalytics.map((point) => ({
            name: point.date ? new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—',
            Impressions: point.impressions ?? 0,
            Clicks: point.clicks ?? 0,
        }));
    }, [adAnalytics]);

    // ИСПРАВЛЕНО: Явно типизируем аккумулятор, чтобы избежать TS18048
    const totals = useMemo(() => {
        return adAnalytics.reduce<{ impressions: number; clicks: number }>(
            (acc, curr) => {
                acc.impressions += curr.impressions || 0;
                acc.clicks += curr.clicks || 0;
                return acc;
            },
            { impressions: 0, clicks: 0 }
        );
    }, [adAnalytics]);

    // ИСПРАВЛЕНО: Теперь totals гарантированно имеет числа, TS доволен
    const totalCtr = useMemo(() => {
        if (!totals.impressions || totals.impressions === 0) return '0.00';
        return ((totals.clicks / totals.impressions) * 100).toFixed(2);
    }, [totals]);

    const ACCENT_CYAN = '#7AE0FF';
    const ACCENT_YELLOW = '#FFD27A';
    const CARD_BG = '#353E4B';

    return (
        <div className="row g-4 mb-4 ad-analytics">
            <div className="col-12 col-xl-8">
                <div className="p-4 rounded-3 h-100" style={{ backgroundColor: '#1e2330', border: '1px solid #353E4B' }}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h6 className="text-white fw-semibold mb-0 d-flex align-items-center gap-2">
                            <i className="bi bi-megaphone-fill text-cyan" />
                            Monetization & Ad Conversion Timeline
                        </h6>
                        <span className="badge px-2.5 py-1 rounded text-success bg-dark border border-secondary small fw-bold font-monospace">
                            Avg CTR: {totalCtr}%
                        </span>
                    </div>

                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={ACCENT_CYAN} stopOpacity={0.25}/>
                                        <stop offset="95%" stopColor={ACCENT_CYAN} stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={ACCENT_YELLOW} stopOpacity={0.25}/>
                                        <stop offset="95%" stopColor={ACCENT_YELLOW} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(130, 133, 135, 0.1)" />
                                <XAxis dataKey="name" stroke="#718096" fontSize={11} tickLine={false} />
                                <YAxis stroke="#718096" fontSize={11} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: CARD_BG, borderColor: '#828487', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="Impressions" stroke={ACCENT_CYAN} strokeWidth={2} fillOpacity={1} fill="url(#colorImpressions)" isAnimationActive={true} />
                                <Area type="monotone" dataKey="Clicks" stroke={ACCENT_YELLOW} strokeWidth={2} fillOpacity={1} fill="url(#colorClicks)" isAnimationActive={true} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="col-12 col-xl-4">
                <div className="p-4 rounded-3 h-100 d-flex flex-column" style={{ backgroundColor: '#1e2330', border: '1px solid #353E4B' }}>
                    <div className="mb-3 d-flex align-items-center justify-content-between">
                        <h6 className="text-white fw-semibold mb-0 d-flex align-items-center gap-2">
                            <i className="bi bi-list-columns-reverse text-cyan" />
                            Daily Metrics Log
                        </h6>
                        <span className="badge px-2.5 py-1 rounded text-secondary bg-dark border border-secondary small font-monospace">
                            Σ {formatNumber(totals.clicks)} clicks
                        </span>
                    </div>

                    <div className="d-flex align-items-center py-2 border-bottom border-secondary/30" style={{ opacity: 0.7, fontSize: '0.8rem' }}>
                        <span className="fw-semibold flex-grow-1 text-secondary">Date</span>
                        <span className="fw-semibold text-end flex-shrink-0 font-monospace text-secondary" style={{ width: '85px' }}>Impr.</span>
                        <span className="fw-semibold text-end flex-shrink-0 font-monospace text-secondary" style={{ width: '65px' }}>Clicks</span>
                        <span className="fw-semibold text-end flex-shrink-0 font-monospace text-secondary" style={{ width: '65px' }}>CTR</span>
                    </div>

                    <div className="flex-grow-1 overflow-auto pe-1" style={{ maxHeight: '265px' }}>
                        {adAnalytics.length === 0 ? (
                            <div className="text-secondary text-center py-5 small my-auto">
                                <i className="bi bi-eye-slash d-block fs-3 mb-2 text-muted" />
                                No campaign traffic records.
                            </div>
                        ) : (
                            [...adAnalytics].reverse().map((point, i) => {
                                const imp = point.impressions || 0;
                                const clk = point.clicks || 0;
                                const dayCtr = imp > 0 ? ((clk / imp) * 100).toFixed(2) : '0.00';

                                return (
                                    <div key={point.date ?? i} className="d-flex align-items-center py-2.5 border-bottom border-secondary/10" style={{ fontSize: '0.85rem' }}>
                                        <span className="text-white fw-medium flex-grow-1 text-truncate">{formatDate(point.date)}</span>
                                        <span className="text-end font-monospace text-cyan flex-shrink-0" style={{ width: '85px' }}>{formatNumber(imp)}</span>
                                        <span className="text-end font-monospace text-warning flex-shrink-0" style={{ width: '65px' }}>{formatNumber(clk)}</span>
                                        <span className="text-end font-monospace text-success fw-semibold flex-shrink-0" style={{ width: '65px' }}>{dayCtr}%</span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};