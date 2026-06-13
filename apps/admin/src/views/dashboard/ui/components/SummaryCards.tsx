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
    <div className="row g-3 mb-4 summary-cards">
        {cards(summary).map(({ icon, label, value, color }) => (
            <div key={label} className="col-6 col-sm-4 col-md-3 col-xl">
                <div className="summary-cards__card">
                    {/* Передаємо колір як CSS-змінну для використання всередині SCSS */}
                    <div
                        className="summary-cards__icon-box"
                        style={{ '--card-icon-color': color } as React.CSSProperties}
                    >
                        <i className={`bi ${icon}`} />
                    </div>
                    <div className="min-w-0 summary-cards__content">
                        <div className="summary-cards__label">{label}</div>
                        <div className="fw-bold fs-5 summary-cards__value">{value}</div>
                    </div>
                </div>
            </div>
        ))}
    </div>
);