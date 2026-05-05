'use client';

import React from 'react';
import { useGetApiAdminDashboardStats } from '@repo/api';
import { SummaryCards }     from '../ui/components/SummaryCards';
import { RecentUsersTable } from '../ui/components/RecentUsersTable';
import { TopEntityTable }   from '../ui/components/TopEntityTable';
import { PopularAlbums }    from '../ui/components/PopularAlbums';

export const DashboardPage = () => {
    const { data, isLoading, isError } = useGetApiAdminDashboardStats();

    const d = (data as any)?.data || (data as any);
    const summary       = d?.summary;
    const recentUsers   = d?.recentUsers   ?? [];
    const topGenres     = d?.topGenres     ?? [];
    const topMoods      = d?.topMoods      ?? [];
    const popularAlbums = d?.popularAlbums ?? [];

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <div className="spinner-border text-primary" />
            </div>
        );
    }

    if (isError) {
        return <div className="p-4 text-danger">Failed to load dashboard stats.</div>;
    }

    return (
        <div className="p-3 p-md-4 bg-admin-primary" style={{ minHeight: '100vh' }}>

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="text-white fw-semibold mb-0">Dashboard</h4>
                <span className="text-secondary small">
                    Today: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                </span>
            </div>

            {/* Summary */}
            <SummaryCards summary={summary} />

            {/* Users + Genres/Moods */}
            <div className="row g-4 mb-4">
                <div className="col-12 ">
                    <RecentUsersTable users={recentUsers} />
                </div>

                <div className="col-12 ">
                    <div className="row g-4">
                        <div className="col-12 col-sm-6 col-lg-6">
                            <TopEntityTable title="Top Genres"     items={topGenres} />
                        </div>
                        <div className="col-12 col-sm-6 col-lg-6">
                            <TopEntityTable title="Trending Moods" items={topMoods} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Albums */}
            <PopularAlbums albums={popularAlbums} />

        </div>
    );
};