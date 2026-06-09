'use client';

import React from 'react';
import type { TopEntityDto } from '@repo/api/admin.ts';
import { getImageUrl } from '@/shared/lib/getImageUrl';
import { formatNumber } from '@/shared/lib/formatNumber';

interface Props {
    title: string;
    items: TopEntityDto[];
}


export const TopEntityTable = ({ title, items }: Props) => {
    const ACCENT_COLOR = '#7AE0FF'; // $admin-btn-primary
    const STROKE_COLOR = '#353E4B'; // $admin-secondary

    // Динамічний вибір іконки в шапці залежно від назви секції
    const getHeaderIcon = (headerTitle: string): string => {
        const t = headerTitle.toLowerCase();
        if (t.includes('genre')) return 'bi-tags-fill';
        if (t.includes('mood')) return 'bi-emoji-smile-fill';
        return 'bi-fire';
    };

    return (
        <div
            className="rounded-3 overflow-hidden h-100"
            style={{
                backgroundColor: '#1e2330',
                border: `1px solid ${STROKE_COLOR}`,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
            }}
        >
            {/* Текстовий заголовок віджета */}
            <div className="px-4 pt-4 pb-3">
                <h6 className="text-white fw-bold mb-0 d-flex align-items-center gap-2">
                    <i className={`bi ${getHeaderIcon(title)}`} style={{ color: ACCENT_COLOR }} />
                    {title}
                </h6>
            </div>

            {/* Службова шапка колонок */}
            <div
                className="d-flex align-items-center px-4 py-2 border-bottom"
                style={{ backgroundColor: '#1a1f2e', borderColor: STROKE_COLOR }}
            >
                <span className="text-secondary small fw-semibold flex-shrink-0" style={{ width: '32px' }}>#</span>
                <span className="text-secondary small fw-semibold flex-grow-1">Title / Category</span>
                <span className="text-secondary small fw-semibold text-end flex-shrink-0" style={{ width: '90px' }}>Total Plays</span>
            </div>

            {/* Список елементів рейтингу */}
            {items.length === 0 ? (
                <div className="text-secondary text-center py-5 small">
                    <i className="bi bi-bar-chart d-block fs-3 mb-2 text-muted" />
                    No analytics data accumulated yet.
                </div>
            ) : (
                items.map((item, i) => {
                    const coverSrc = getImageUrl(item.coverUrl);

                    return (
                        <div
                            key={item.id ?? i}
                            className="d-flex align-items-center px-4 py-3 transition-all"
                            style={{
                                backgroundColor: i % 2 === 0 ? '#212631' : '#1e2330',
                                borderColor: 'rgba(255, 255, 255, 0.03)',
                                cursor: 'default'
                            }}
                        >
                            {/* Порядковий індекс у топі (Захищений від стиснення) */}
                            <span
                                className="small flex-shrink-0 fw-semibold"
                                style={{
                                    width: '32px',
                                    color: i === 0 ? ACCENT_COLOR : i === 1 ? '#4B7490' : '#718096'
                                }}
                            >
                                {i + 1}
                            </span>

                            {/* Обкладинка + Назва елемента */}
                            <div className="d-flex align-items-center gap-3 flex-grow-1 min-w-0">
                                <div
                                    className="rounded d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0"
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        background: coverSrc ? 'transparent' : 'linear-gradient(135deg, #325B76, #212631)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)'
                                    }}
                                >
                                    {coverSrc ? (
                                        <img
                                            src={coverSrc}
                                            alt={item.name ?? 'Cover'}
                                            className="w-100 h-100 object-fit-cover"
                                        />
                                    ) : (
                                        <i className="bi bi-music-note" style={{ fontSize: '0.8rem', color: ACCENT_COLOR }} />
                                    )}
                                </div>
                                <span className="text-white small fw-semibold text-truncate">
                                    {item.name || '—'}
                                </span>
                            </div>

                            {/* Кількість прослуховувань (Захищена від згортання) */}
                            <span
                                className="text-white-50 small text-end text-nowrap flex-shrink-0 fw-medium"
                                style={{ width: '90px', color: '#e2e8f0' }}
                            >
                                {formatNumber(item.totalPlays)} <span className="text-muted" style={{ fontSize: '0.75rem' }}>plays</span>
                            </span>
                        </div>
                    );
                })
            )}
        </div>
    );
};