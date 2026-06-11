'use client';

import React, { useState } from 'react';

interface TableToolbarProps {
    title: string;
    subtitle: string;
    addButtonText: string;
    onSearch: (value: string) => void;
    onFilterClick?: () => void;
    onDateChange?: (range: { start: string; end: string }) => void;
    onAddClick?: () => void;
}

export const TableToolbar = ({
                                 title,
                                 subtitle,
                                 addButtonText,
                                 onSearch,
                                 onFilterClick,
                                 onAddClick,
                             }: TableToolbarProps) => {
    const [searchValue, setSearchValue] = useState('');

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchValue(value);
        onSearch(value);
    };

    return (
        <div className="table-toolbar d-flex align-items-center justify-content-between mb-4 gap-3">
            {/* Title block */}
            <div className="title-section">
                <p className="h4 mb-1 fw-semibold text-white">{title}</p>
                <p className="text-white h6 fw-light">{subtitle}</p>
            </div>

            {/* Actions block */}
            <div className="actions-section d-flex align-items-center gap-2 flex-grow-1 justify-content-end">

                {/* Search Input */}
                <div className="search-container position-relative flex-grow-1 max-w-400">
                    <img src="/images/icons/search.svg" alt="search" className="position-absolute start-0 top-50 translate-middle-y ms-3"/>
                    <input
                        type="text"
                        className="form-control bg-dark border-secondary text-white ps-5 py-2 shadow-none"
                        placeholder="Search by ID, product, or others..."
                        value={searchValue}
                        onChange={handleSearchChange}
                    />
                </div>

                {/* Filter Button */}
                <button
                    className="btn btn-dark border-secondary d-flex align-items-center gap-2 py-2 px-3"
                    onClick={onFilterClick}
                >
                    <img src="/images/icons/filter.svg" alt="filter"/>
                    <span>Filters</span>
                </button>

                {/* Date Range Picker (Placeholder) */}
                <button className="btn btn-dark border-secondary d-flex align-items-center gap-2 py-2 px-3">
                    <img src="/images/icons/calendar.svg" alt="calendar"/>
                    <span className="small">April 11 - April 24</span>
                </button>

                {/* Add New Button */}
                <button
                    className="btn btn-primary d-flex align-items-center gap-2 py-2 px-3 text-dark fw-bold"
                    onClick={onAddClick}
                >
                    <img src="/images/icons/plus.svg" alt="plus"/>
                    <span>{addButtonText}</span>
                </button>
            </div>
        </div>
    );
};