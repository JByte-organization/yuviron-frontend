import React from 'react';

interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const Pagination = ({ page, totalPages, onPageChange }: PaginationProps) => {
    if (totalPages <= 1) return null;

    // Генеруємо масив сторінок з ellipsis
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
        .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
            if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                acc.push('ellipsis');
            }
            acc.push(p);
            return acc;
        }, []);

    return (
        <div className="d-flex align-items-center gap-1">

            {/* Стрілка ліворуч */}
            <button
                className="admin-pagination__btn"
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                aria-label="Previous page"
            >
                <i className="bi bi-chevron-left" />
            </button>

            {/* Номери сторінок */}
            {pages.map((p, idx) =>
                p === 'ellipsis' ? (
                    <span key={`ellipsis-${idx}`} className="admin-pagination__ellipsis">
                        ...
                    </span>
                ) : (
                    <button
                        key={p}
                        className={`admin-pagination__btn${page === p ? ' admin-pagination__btn--active' : ''}`}
                        onClick={() => onPageChange(p as number)}
                        aria-label={`Page ${p}`}
                        aria-current={page === p ? 'page' : undefined}
                    >
                        {p}
                    </button>
                )
            )}

            {/* Стрілка праворуч */}
            <button
                className="admin-pagination__btn"
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                aria-label="Next page"
            >
                <i className="bi bi-chevron-right" />
            </button>
        </div>
    );
};