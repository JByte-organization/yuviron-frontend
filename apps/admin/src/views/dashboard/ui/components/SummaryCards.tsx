'use client';

import React from 'react';
import type { DashboardSummaryDto } from '@repo/api/admin.ts';
import { formatNumber } from '@/shared/lib/formatNumber';

interface Props {
    summary?: DashboardSummaryDto;
}

const cards = (s?: DashboardSummaryDto) => [
    { icon: 'bi-music-note-beamed',  label: 'Total Tracks',   value: formatNumber(s?.totalTracks), color: '#7AE0FF' },
    { icon: 'bi-mic-fill',           label: 'Total Artists',  value: formatNumber(s?.totalArtists), color: '#7AE0FF' },
    { icon: 'bi-disc-fill',          label: 'Total Albums',   value: formatNumber(s?.totalAlbums), color: '#7AE0FF' },
    { icon: 'bi-people-fill',        label: 'Total Users',    value: formatNumber(s?.totalUsers), color: '#7AE0FF' },
    { icon: 'bi-star-fill',          label: 'Premium Users',  value: formatNumber(s?.totalPremiumUsers), color: '#b907ff' },
    { icon: 'bi-person-plus-fill',   label: 'New (24h)',      value: formatNumber(s?.newUsersLast24h), color: '#12ff93' },
    { icon: 'bi-play-btn-fill',      label: 'Total Plays',    value: formatNumber(s?.totalPlays), color: '#7AE0FF' },
];

export const SummaryCards = ({ summary }: Props) => (
    <div className="row g-3 mb-4">
        {cards(summary).map(({ icon, label, value, color }) => (
            <div key={label} className="col-6 col-sm-4 col-md-3 col-xl">
                <div
                    className="rounded-3 p-3 h-100 d-flex align-items-center gap-3 transition-all"
                    style={{
                        backgroundColor: '#1e2330',
                        border: '1px solid #353E4B',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
                    }}
                >
                    <div
                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: '40px', height: '40px', backgroundColor: '#212631', fontSize: '1.2rem', color: color }}
                    >
                        <i className={`bi ${icon}`} />
                    </div>
                    <div className="min-w-0">
                        <div className="small text-truncate" style={{ color: '#718096', fontWeight: 500, fontSize: 12 }}>{label}</div>
                        <div className="fw-bold fs-5" style={{ color: '#fff', letterSpacing: '-0.5px' }}>{value}</div>
                    </div>
                </div>
            </div>
        ))}
    </div>
);