'use client';

import React from 'react';
import {
    useGetApiAdminDashboardStats,
    type DashboardSummaryDto,
    type RecentUserDto,
    type TopEntityDto,
    type PopularAlbumDto, AdAnalyticsPointDto
} from '@repo/api/admin.ts';
import { SummaryCards }     from '../ui/components/SummaryCards';
import { RecentUsersTable } from '../ui/components/RecentUsersTable';
import { TopEntityTable }   from '../ui/components/TopEntityTable';
import { PopularAlbums }    from '../ui/components/PopularAlbums';
import { AnalyticsCharts }  from '../ui/components/AnalyticsCharts';
import {AdAnalytics} from "@/views/dashboard/ui/components/AdAnalytics.tsx";

interface AdminDashboardStats {
    summary?: DashboardSummaryDto;
    recentUsers?: RecentUserDto[];
    topGenres?: TopEntityDto[];
    topMoods?: TopEntityDto[];
    popularAlbums?: PopularAlbumDto[];
}

export const DashboardPage = () => {
    const { data, isLoading, isError } = useGetApiAdminDashboardStats();

    const d = (data as { data?: AdminDashboardStats & { adAnalytics?: AdAnalyticsPointDto[] } } | undefined)?.data
        ?? (data as (AdminDashboardStats & { adAnalytics?: AdAnalyticsPointDto[] }) | undefined);

    const summary       = d?.summary;
    const recentUsers   = d?.recentUsers   ?? [];
    const topGenres     = d?.topGenres     ?? [];
    const topMoods      = d?.topMoods      ?? [];
    const popularAlbums = d?.popularAlbums ?? [];
    const adAnalytics   = d?.adAnalytics   ?? [];

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#222731' }}>
                <div className="spinner-border text-info" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-4 text-danger bg-admin-primary fw-semibold m-3 rounded-3">
                Failed to load dashboard operational statistics. Please verify system gateway.
            </div>
        );
    }

    return (
        <div className="p-3 p-md-4" style={{ minHeight: '100vh'}}>

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="text-white fw-bold mb-0">Analytics Dashboard</h4>
                    <p className="text-secondary small mb-0">Real-time music platform health control monitor</p>
                </div>
                <span className="badge p-2 px-3 small border border-secondary" style={{ backgroundColor: '#325B76' }}>
                    <i className="bi bi-calendar3 me-2" />
                    Today: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
            </div>

            <SummaryCards summary={summary} />

            <AnalyticsCharts topGenres={topGenres} topMoods={topMoods} />

            <AdAnalytics adAnalytics={adAnalytics} />

            <div className="row g-4 mb-4">
                <div className="col-12 col-xl-6">
                    <RecentUsersTable users={recentUsers} />
                </div>

                <div className="col-12 col-xl-6">
                    <div className="row g-4">
                        <div className="col-12 col-sm-6">
                            <TopEntityTable title="Top Genres" items={topGenres} />
                        </div>
                        <div className="col-12 col-sm-6">
                            <TopEntityTable title="Trending Moods" items={topMoods} />
                        </div>
                    </div>
                </div>
            </div>

            <PopularAlbums albums={popularAlbums} />

        </div>
    );
};