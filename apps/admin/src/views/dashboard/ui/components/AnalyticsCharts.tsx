'use client';

import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import type { TopEntityDto } from '@repo/api/admin.ts';

interface AnalyticsChartsProps {
    topGenres: TopEntityDto[];
    topMoods: TopEntityDto[];
}

export const AnalyticsCharts = ({ topGenres, topMoods }: AnalyticsChartsProps) => {
    const genreData = topGenres.map((g) => ({
        name: g.name || '—',
        Plays: g.totalPlays ?? 0,
    }));

    const moodData = topMoods.slice(0, 5).map((m) => ({
        name: m.name || '—',
        Plays: m.totalPlays ?? 0,
    }));

    // Фірмові кольори адмін-панелі Yuviron
    const ACCENT_COLOR = '#7AE0FF';  // $admin-btn-primary
    const PRIMARY_COLOR = '#4B7490'; // $admin-primary
    const CARD_BG = '#353E4B';       // $admin-secondary

    return (
        <div className="row g-4 mb-4">
            {/* Волновой график: Реальные прослушивания по жанрам */}
            <div className="col-12 col-xl-8">
                <div className="p-4 rounded-3 h-100" style={{ backgroundColor: '#1e2330', border: '1px solid #353E4B' }}>
                    <h6 className="text-white fw-semibold mb-4 d-flex align-items-center gap-2">
                        <i className="bi bi-graph-up-arrow text-cyan" />
                        Genre Popularity Analytics (Total Plays)
                    </h6>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={genreData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorPlays" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={ACCENT_COLOR} stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor={ACCENT_COLOR} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(130, 133, 135, 0.1)" />
                                <XAxis dataKey="name" stroke="#718096" fontSize={11} tickLine={false} />
                                <YAxis stroke="#718096" fontSize={11} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: CARD_BG, borderColor: '#828487', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                {/* Выводим только один честный график прослушиваний */}
                                <Area
                                    type="monotone"
                                    dataKey="Plays"
                                    stroke={ACCENT_COLOR}
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorPlays)"
                                    isAnimationActive={true}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Гистограмма: Реальное распределение прослушиваний по настроениям */}
            <div className="col-12 col-xl-4">
                <div className="p-4 rounded-3 h-100" style={{ backgroundColor: '#1e2330', border: '1px solid #353E4B' }}>
                    <h6 className="text-white fw-semibold mb-4 d-flex align-items-center gap-2">
                        <i className="bi bi-bar-chart-line text-cyan" />
                        Moods Performance (Top 5)
                    </h6>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={moodData} layout="vertical" margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(130, 133, 135, 0.05)" horizontal={false} />
                                <XAxis type="number" stroke="#718096" fontSize={10} tickLine={false} />
                                <YAxis dataKey="name" type="category" stroke="#fff" fontSize={11} tickLine={false} width={70} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: CARD_BG, borderColor: '#828487', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="Plays" radius={[0, 4, 4, 0]} barSize={14} isAnimationActive={true}>
                                    {moodData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? ACCENT_COLOR : PRIMARY_COLOR} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};