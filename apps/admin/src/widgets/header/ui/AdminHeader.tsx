'use client';

import React from 'react';
import { SIDEBAR_WIDTH } from '@/shared/config/constants';

interface Props {
    onMenuToggle: () => void;
    sidebarOpen: boolean;
    isDesktop: boolean;
}

export const AdminHeader = ({ onMenuToggle, sidebarOpen, isDesktop }: Props) => {
    const headerLeft = sidebarOpen && isDesktop ? `${SIDEBAR_WIDTH}px` : '0px';
    const headerWidth = sidebarOpen && isDesktop ? `calc(100% - ${SIDEBAR_WIDTH}px)` : '100%';

    return (
        <header
            className="fixed-top"
            style={{
                zIndex: 1030,
                left: headerLeft,
                width: headerWidth,
                transition: 'left 0.25s ease, width 0.25s ease',
                backgroundColor: '#171717',
            }}
        >
            <div className="admin-header d-flex align-items-center px-3 px-md-4 py-3 border-bottom border-secondary">
                <button
                    className="btn btn-sm btn-outline-secondary border-0 me-2 me-md-3"
                    onClick={onMenuToggle}
                    style={{ position: 'relative', zIndex: 100 }}
                    title="Toggle navigation"
                >
                    <span style={{ fontSize: '1.2rem' }}>☰</span>
                </button>

                <div className="ms-auto d-flex align-items-center gap-3">
                    <span className="text-white small d-none d-sm-inline">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </span>
                </div>
            </div>
        </header>
    );
};