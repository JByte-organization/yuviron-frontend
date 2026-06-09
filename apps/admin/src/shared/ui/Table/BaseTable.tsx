import React from 'react';
import Image from 'next/image'

interface BaseTableProps {
    title: string;
    subtitle?: string;
    /** Без onNewClick кнопка «+ New» не рендериться (напр., read-only списки заявок). */
    onNewClick?: () => void;
    searchPlaceholder?: string;
    searchValue?: string;
    onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSearchKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onSearchClear?: () => void;
    columns: string[];
    children: React.ReactNode;
    pagination?: React.ReactNode;
    onDeleteSelected?: () => void;
    isAllSelected?: boolean;
    onSelectAll?: () => void;
    selectedCount?: number;
    // Фільтри — кожна сторінка передає свій контент
    filterContent?: React.ReactNode;
    onApplyFilters?: () => void;
    onResetFilters?: () => void;
    activeFiltersCount?: number;
    // Сортування
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
    sortOptions?: { value: string; label: string }[];
}

export const BaseTable = ({
                              title,
                              subtitle,
                              onNewClick,
                              searchPlaceholder,
                              searchValue,
                              onSearchChange,
                              onSearchKeyDown,
                              onSearchClear,
                              columns,
                              children,
                              pagination,
                              onDeleteSelected,
                              isAllSelected,
                              onSelectAll,
                              selectedCount,
                              filterContent,
                              onApplyFilters,
                              onResetFilters,
                              activeFiltersCount = 0,
                              sortBy,
                              sortOrder = 'asc',
                              onSortChange,
                              sortOptions,
                          }: BaseTableProps) => {
    const offcanvasId = `filterOffcanvas-${title.replace(/\s+/g, '')}`;

    return (
        <div className="p-2 p-lg-3 bg-admin-primary" style={{ minHeight: '100vh' }}>

            {/* ─── Header ───────────────────────────────── */}
            <div className="row align-items-center gap-3 gap-xxl-2 mb-4">
                {/* Title */}
                <div className="col-12 col-md-auto">
                    <p className="h4 text-white fw-semibold mb-1">{title}</p>
                    {subtitle && <p className="text-white h6 fw-light mb-0">{subtitle}</p>}
                </div>

                {/* Controls */}
                <div className="col-12 col-md d-flex align-items-center justify-content-start justify-content-xxl-end gap-2 flex-wrap flex-md-nowrap">
                    {/* Search */}
                    <div className="search-wrapper py-2 flex-grow-1 flex-md-grow-0">
                        <Image
                            src="/images/icons/search.svg"
                            width={16}
                            height={16}
                            alt="search"
                            className="img-icon"
                        />
                        <input
                            type="text"
                            className="search-input"
                            placeholder={searchPlaceholder ?? 'Search...'}
                            value={searchValue ?? ''}
                            onChange={onSearchChange}
                            onKeyDown={onSearchKeyDown}
                        />
                        {searchValue && onSearchClear && (
                            <button
                                className="btn-close btn-close-white btn-sm ms-1"
                                onClick={onSearchClear}
                                aria-label="Clear search"
                            />
                        )}
                    </div>

                    {/* Sort dropdown */}
                    {sortOptions && sortOptions.length > 0 && (
                        <div className="dropdown">
                            <button
                                className="btn btn-admin-dark py-2 h6 d-flex align-items-center mb-0 gap-2"
                                type="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <i className="bi bi-sort-down"/>
                                Sort
                            </button>
                            <ul className="dropdown-menu dropdown-menu-dark dropdown-menu-end">
                                {sortOptions.map((opt) => (
                                    <li key={opt.value}>
                                        <button
                                            className={`dropdown-item d-flex align-items-center justify-content-between${sortBy === opt.value ? ' active' : ''}`}
                                            onClick={() => onSortChange?.(
                                                opt.value,
                                                sortBy === opt.value && sortOrder === 'asc' ? 'desc' : 'asc'
                                            )}
                                        >
                                            {opt.label}
                                            {sortBy === opt.value && (
                                                <i className={`bi bi-arrow-${sortOrder === 'asc' ? 'up' : 'down'} ms-2`}/>
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Filters button */}
                    <button
                        className="btn btn-admin-dark py-2 h6 d-flex align-items-center mb-0 gap-2"
                        type="button"
                        data-bs-toggle="offcanvas"
                        data-bs-target={`#${offcanvasId}`}
                        aria-controls={offcanvasId}
                    >
                        <Image
                            src="/images/icons/filter.svg"
                            width={16}
                            height={16}
                            alt="filter"
                            className="img-icon"
                        />
                        Filters
                        {activeFiltersCount > 0 && (
                            <span className="badge bg-primary rounded-pill">
                    {activeFiltersCount}
                </span>
                        )}
                    </button>

                    {/* New button */}
                    {onNewClick && (
                        <button
                            className="btn btn-admin-dark h5 px-4 py-2 text-nowrap mb-0"
                            onClick={onNewClick}
                        >
                            + New {title}
                        </button>
                    )}
                </div>
            </div>


            {/* ─── Table ────────────────────────────────── */}
            <div className="rounded-3 overflow-hidden shadow-lg table-admin">
                <div className="table-responsive">
                    <table className="table table-dark table-striped table-hover mb-0 align-middle">
                        <thead className="bg-admin-secondary">
                            <tr className="border-bottom border-secondary">
                                <th className="px-4" style={{ width: '40px' }}>
                                    <input
                                        type="checkbox"
                                        className="form-check-input border-secondary"
                                        style={{ backgroundColor: 'var(--admin-secondary)' }}
                                        checked={isAllSelected}
                                        onChange={onSelectAll}
                                    />
                                </th>
                                {columns.map((col, idx) => (
                                    <th key={idx} className="text-white h5 fw-medium">{col}</th>
                                ))}
                                <th className="text-white h5 fw-medium text-end px-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>{children}</tbody>
                    </table>
                </div>
            </div>

            {/* ─── Footer ───────────────────────────────── */}
            <div className="d-flex justify-content-between align-items-center mt-4">
                <div>{pagination}</div>
                <button
                    className="btn bg-admin-secondary admin-text rounded-3 btn-dark fw-medium py-2 px-4"
                    disabled={!selectedCount}
                    onClick={onDeleteSelected}
                >
                    Delete Selected {selectedCount ? `(${selectedCount})` : ''}
                </button>
            </div>

            {/* ─── Offcanvas фільтри ────────────────────── */}
            <div
                className="offcanvas offcanvas-end bg-admin-primary text-white"
                tabIndex={-1}
                id={offcanvasId}
                aria-labelledby={`${offcanvasId}Label`}
            >
                <div className="offcanvas-header border-bottom border-secondary">
                    <h5 className="offcanvas-title fw-semibold" id={`${offcanvasId}Label`}>
                        Filters
                        {activeFiltersCount > 0 && (
                            <span className="badge bg-primary ms-2">{activeFiltersCount}</span>
                        )}
                    </h5>
                    <button
                        type="button"
                        className="btn-close btn-close-white"
                        data-bs-dismiss="offcanvas"
                        aria-label="Close"
                    />
                </div>

                <div className="offcanvas-body d-flex flex-column">
                    {/* Контент фільтрів — передається з кожної сторінки */}
                    <div className="flex-grow-1 overflow-auto">
                        {filterContent ?? (
                            <p className="text-secondary">No filters available.</p>
                        )}
                    </div>

                    {/* Кнопки Apply / Reset */}
                    <div className="d-flex gap-2 pt-3 border-top border-secondary">
                        <button
                            className="btn btn-outline-secondary flex-grow-1"
                            onClick={onResetFilters}
                            data-bs-dismiss="offcanvas"
                        >
                            Reset
                        </button>
                        <button
                            className="btn btn-primary flex-grow-1"
                            onClick={onApplyFilters}
                            data-bs-dismiss="offcanvas"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};