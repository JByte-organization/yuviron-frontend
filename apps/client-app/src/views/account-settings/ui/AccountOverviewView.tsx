'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useGetApiAuthMe, type CurrentUserDto } from '@repo/api/client';
import { getImageUrl } from '@/shared/lib/getImageUrl';

export const AccountOverviewView = () => {
    const router = useRouter();

    // Отримуємо основні дані сесії та аккаунту
    const { data: meRaw, isLoading } = useGetApiAuthMe();
    const me = (meRaw as CurrentUserDto) ?? null;

    if (isLoading) {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '40vh' }}>
                <div className="spinner-border spinner-border-sm text-secondary" role="status" />
            </div>
        );
    }

    const avatarSrc = getImageUrl(me?.profile?.avatarUrl);

    // Безпечний вивід дати народження без гідраційних багів
    const formattedDob = me?.profile?.dateOfBirth
        ? new Date(me.profile.dateOfBirth).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
        : 'Not specified';

    return (
        <div className="account-overview">
            <header className="overview-header mb-5">
                <p className="h3 fw-bold text-white mb-1">Account overview</p>
                <p className="text-secondary small">Profile diagnostic parameters and subscription metrics.</p>
            </header>

            <div className="row g-4">
                {/* КАРТКА 1: ПРОФІЛЬ КОРИСТУВАЧА */}
                <div className="col-12 col-lg-7">
                    <div className="overview-info-block h-100 d-flex flex-column justify-content-between">
                        <div>
                            <h4 className="block-title mb-4">Profile Details</h4>

                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div className="profile-preview-avatar">
                                    {avatarSrc ? (
                                        <img src={avatarSrc} alt="Avatar" className="w-100 h-100 rounded-circle object-fit-cover" />
                                    ) : (
                                        <i className="bi bi-person-fill text-secondary fs-4" />
                                    )}
                                </div>
                                <div>
                                    <h5 className="fw-bold text-white mb-0">
                                        {me?.profile?.firstName || 'Yuviron User'}
                                    </h5>
                                    <span className="text-secondary small font-monospace">{me?.email}</span>
                                </div>
                            </div>

                            <div className="meta-info-list d-flex flex-column gap-3">
                                <div className="meta-item d-flex justify-content-between align-items-center">
                                    <span className="meta-label">Country / Region</span>
                                    <span className="meta-value text-white">{me?.profile?.country || 'Not specified'}</span>
                                </div>
                                <div className="meta-item d-flex justify-content-between align-items-center">
                                    <span className="meta-label">Date of birth</span>
                                    <span className="meta-value text-white">{formattedDob}</span>
                                </div>
                                <div className="meta-item d-flex justify-content-between align-items-center">
                                    <span className="meta-label">Gender</span>
                                    <span className="meta-value text-white text-capitalize">{me?.profile?.gender || 'Not specified'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="d-flex justify-content-start mt-4">
                            <button
                                type="button"
                                className="yuviron-btn-minimal"
                                onClick={() => router.push('/account-settings/profile')}
                            >
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>

                {/* 👑 КАРТКА 2: КОСМІЧНИЙ СТАТУС ПРЕМІУМУ */}
                <div className="col-12 col-lg-5">
                    <div className="overview-info-block premium-status-cosmic h-100 d-flex flex-column justify-content-between">
                        <div>
                            <div className="cosmic-badge-wrapper">
                                <span className="premium-block-badge">Your Plan</span>
                            </div>

                            {/* Якщо преміум активний — робимо сам текст заголовка преміальним градієнтом */}
                            <h3 className={`fw-black mt-3 mb-2 ${me?.isPremium ? 'gradient-plan-title' : 'standard-plan-title'}`}>
                                {me?.isPremium ? 'Yuviron Premium' : 'Yuviron Free'}
                            </h3>

                            <p className="cosmic-description small mt-2">
                                {me?.isPremium
                                    ? 'Unlimited high-bitrate spatial audio streams, native gradient maps and zero commercial audio interruptions active.'
                                    : 'Ad-supported streaming canvas. Upgrade to unlock personal color nodes, lossless compression and offline buffer.'}
                            </p>
                        </div>

                        <div className="mt-4">
                            {me?.isPremium ? (
                                <button
                                    type="button"
                                    className="yuviron-btn-minimal w-100 py-2.5"
                                    onClick={() => router.push('/premium/manage')}
                                >
                                    Manage Subscription
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="yuviron-btn-cosmic-glow w-100 py-2.5"
                                    onClick={() => router.push('/premium')}
                                >
                                    Join Premium
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};