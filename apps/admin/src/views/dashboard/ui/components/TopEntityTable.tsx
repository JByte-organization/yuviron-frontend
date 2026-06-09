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
    // Динамічний вибір іконки в шапці залежно від назви секції
    const getHeaderIcon = (headerTitle: string): string => {
        const t = headerTitle.toLowerCase();
        if (t.includes('genre')) return 'bi-tags-fill';
        if (t.includes('mood')) return 'bi-emoji-smile-fill';
        return 'bi-fire';
    };

    // Повертає відповідний клас для підсвічування лідерів рейтингу
    const getRankModifier = (index: number): string => {
        if (index === 0) return 'top-entity-table__rank--first';
        if (index === 1) return 'top-entity-table__rank--second';
        return '';
    };

    return (
        <div className="top-entity-table h-100">
            {/* Текстовий заголовок віджета */}
            <div className="px-4 pt-4 pb-3">
                <h6 className="text-white fw-bold mb-0 d-flex align-items-center gap-2">
                    <i className={`bi ${getHeaderIcon(title)} top-entity-table__title-icon`} />
                    {title}
                </h6>
            </div>

            {/* Службова шапка колонок */}
            <div className="d-flex align-items-center px-4 py-2 top-entity-table__th">
                <span className="small fw-semibold flex-shrink-0 top-entity-table__col-idx">#</span>
                <span className="small fw-semibold flex-grow-1 top-entity-table__col-profile">Title / Category</span>
                <span className="small fw-semibold text-end flex-shrink-0 top-entity-table__col-plays">Total Plays</span>
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
                            className="d-flex align-items-center px-4 py-3 top-entity-table__row"
                        >
                            {/* Порядковий індекс у топі */}
                            <span className={`small flex-shrink-0 fw-semibold top-entity-table__rank ${getRankModifier(i)}`}>
                                {i + 1}
                            </span>

                            {/* Обкладинка + Назва елемента */}
                            <div className="d-flex align-items-center gap-3 flex-grow-1 min-w-0">
                                <div
                                    className={`rounded d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0 top-entity-table__cover ${
                                        !coverSrc ? 'top-entity-table__cover--empty' : ''
                                    }`}
                                >
                                    {coverSrc ? (
                                        <img
                                            src={coverSrc}
                                            alt={item.name ?? 'Cover'}
                                            className="w-100 h-100 object-fit-cover"
                                        />
                                    ) : (
                                        <i className="bi bi-music-note" />
                                    )}
                                </div>
                                <span className="text-white small fw-semibold text-truncate">
                                    {item.name || '—'}
                                </span>
                            </div>

                            {/* Кількість прослуховувань */}
                            <span className="small text-end text-nowrap flex-shrink-0 fw-medium top-entity-table__plays-count">
                                {formatNumber(item.totalPlays)}{' '}
                                <span className="top-entity-table__plays-label">plays</span>
                            </span>
                        </div>
                    );
                })
            )}
        </div>
    );
};