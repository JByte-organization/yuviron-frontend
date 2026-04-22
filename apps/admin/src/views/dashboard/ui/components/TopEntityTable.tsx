import React from 'react';
import type { TopEntityDto } from '@repo/api';

interface Props {
    title: string;
    items: TopEntityDto[];
}

const formatNumber = (n?: number): string => {
    if (!n) return '0';
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
};

export const TopEntityTable = ({ title, items }: Props) => (
    <div className="rounded-3 overflow-hidden" style={{ backgroundColor: '#1e2330' }}>

        <div className="px-4 pt-4 pb-2">
            <h6 className="text-white fw-semibold mb-0">{title}</h6>
        </div>

        {/* Header */}
        <div
            className="d-flex align-items-center px-4 py-2 border-bottom border-secondary"
            style={{ backgroundColor: '#1a1f2e' }}
        >
            <span className="text-secondary small" style={{ width: '32px' }}>#</span>
            <span className="text-secondary small flex-grow-1">Name</span>
            <span className="text-secondary small text-end" style={{ width: '90px' }}>Plays</span>
        </div>

        {items.length === 0 ? (
            <div className="text-secondary text-center py-4 small">No data</div>
        ) : items.map((item, i) => {
            const coverSrc = item.coverUrl
                ? `https://api.yuviron.com/storage/${item.coverUrl}`
                : null;

            return (
                <div
                    key={item.id}
                    className="d-flex align-items-center px-4 py-3 border-bottom border-secondary"
                    style={{ backgroundColor: i % 2 === 0 ? '#212631' : '#1e2330' }}
                >
                    <span className="text-secondary small" style={{ width: '32px' }}>{i + 1}</span>

                    <div className="d-flex align-items-center gap-2 flex-grow-1 min-w-0">
                        <div
                            className="rounded bg-secondary d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0"
                            style={{ width: '30px', height: '30px' }}
                        >
                            {coverSrc
                                ? <img src={coverSrc} alt={item.name ?? ''} className="w-100 h-100 object-fit-cover" />
                                : <span style={{ fontSize: '0.7rem' }}>🎵</span>
                            }
                        </div>
                        <span className="text-white small text-truncate">{item.name || '—'}</span>
                    </div>

                    <span className="text-secondary small text-end text-nowrap" style={{ width: '90px' }}>
                        {formatNumber(item.totalPlays)} plays
                    </span>
                </div>
            );
        })}
    </div>
);