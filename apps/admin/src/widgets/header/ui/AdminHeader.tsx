'use client';

import React from 'react';

interface Props {
    onMenuToggle: () => void;
}

export const AdminHeader = ({ onMenuToggle }: Props) => {
    return (
        <header className="admin-header d-flex align-items-center px-4 py-3 border-bottom border-secondary">

            {/* Бургер — на всех размерах экрана */}
            <button
                className="btn btn-sm btn-outline-secondary border-0 me-3"
                onClick={onMenuToggle}
            >
                <span style={{ fontSize: '1.2rem' }}>☰</span>
            </button>

            <div className="ms-auto d-flex align-items-center gap-3">
                <span className="text-secondary small">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
            </div>
        </header>
    );
};