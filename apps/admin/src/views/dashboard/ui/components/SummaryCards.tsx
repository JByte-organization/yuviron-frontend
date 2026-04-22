import React from 'react';
import type { DashboardSummaryDto } from '@repo/api';

interface Props {
    summary?: DashboardSummaryDto;
}

const formatNumber = (n?: number): string => {
    if (!n) return '0';
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
};

const cards = (s?: DashboardSummaryDto) => [
    { icon: '🎵', label: 'Total Tracks',   value: formatNumber(s?.totalTracks) },
    { icon: '🎤', label: 'Total Artists',  value: formatNumber(s?.totalArtists) },
    { icon: '💿', label: 'Total Albums',   value: formatNumber(s?.totalAlbums) },
    { icon: '👥', label: 'Total Users',    value: formatNumber(s?.totalUsers) },
    { icon: '⭐', label: 'Premium Users',  value: formatNumber(s?.totalPremiumUsers) },
    { icon: '🆕', label: 'New (24h)',      value: formatNumber(s?.newUsersLast24h) },
    { icon: '▶️', label: 'Total Plays',   value: formatNumber(s?.totalPlays) },
];

export const SummaryCards = ({ summary }: Props) => (
    <div className="row g-3 mb-4">
        {cards(summary).map(({ icon, label, value }) => (
            <div key={label} className="col-6 col-sm-4 col-md-3 col-xl">
                <div
                    className="rounded-3 p-3 h-100 d-flex align-items-center gap-3"
                    style={{ backgroundColor: '#1e2330' }}
                >
                    <div
                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: '42px', height: '42px', backgroundColor: '#2a3045', fontSize: '1.1rem' }}
                    >
                        {icon}
                    </div>
                    <div className="min-w-0">
                        <div className="text-secondary small text-truncate">{label}</div>
                        <div className="text-white fw-bold fs-5">{value}</div>
                    </div>
                </div>
            </div>
        ))}
    </div>
);