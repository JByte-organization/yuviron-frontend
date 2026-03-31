import React from 'react';

interface BaseTableProps {
    title: string;
    subtitle?: string;
    onNewClick: () => void;
    searchPlaceholder?: string;
    columns: string[];
    children: React.ReactNode;
    pagination?: React.ReactNode;
}

export const BaseTable = ({ title, subtitle, onNewClick, searchPlaceholder, columns, children, pagination}: BaseTableProps) => {
    return (
        <div className="p-3 bg-admin-primary" style={{ minHeight: '100vh' }}>
            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="">
                    <p className="h4 text-white fw-semibold mb-1">{title}</p>
                    {subtitle && <p className="text-white h6 fw-light">{subtitle}</p>}
                </div>

                <div className="d-flex gap-2 align-items-center justify-content-center">
                    <div className="search-wrapper py-2">
                        <img
                            src="/images/icons/search.svg"
                            alt="search"
                            className="img-icon"
                        />
                        <input
                            type="text"
                            className="search-input"
                            placeholder={searchPlaceholder || "Search by ID, product, or others..."}
                        />
                    </div>
                    <button className="btn btn-admin-dark py-2 h6 d-flex align-items-center mb-0">
                        <img
                            src="/images/icons/filter.svg"
                            alt="search"
                            className="img-icon"
                        />
                        Filters
                    </button>

                    <button className="btn btn-admin-dark h5 px-4 py-2 text-nowrap mb-0" onClick={onNewClick}>
                        + New {title}
                    </button>
                </div>

            </div>

            {/* Table Section */}
            <div className="rounded-3 overflow-hidden shadow-lg">
                <table className="table table-dark table-striped table-hover mb-0 align-middle">
                    <thead className="bg-admin-primary">
                    <tr className="border-bottom border-secondary">
                        <th className="" style={{ width: '40px' }}>
                            <input type="checkbox" className="form-check-input bg-dark border-secondary" />
                        </th>
                        {columns.map((col, idx) => (
                            <th key={idx} className="text-white h5 fw-medium text-start">
                                {col}
                            </th>
                        ))}
                        <th className="text-white h5 fw-medium text-start">Action</th>
                    </tr>
                    </thead>
                    <tbody>{children}</tbody>
                </table>
            </div>

            {/* Footer Section */}
            <div className="d-flex justify-content-between align-items-center mt-4">
                <div className="pagination-container">{pagination}</div>
                <button className="btn bg-admin-secondary admin-text rounded-3 btn-dark fw-medium py-2 px-4">
                    Delete Selected
                </button>
            </div>
        </div>
    );
};