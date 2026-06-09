'use client';

import React from 'react';
import type { RecentUserDto } from '@repo/api/admin.ts';
import { getImageUrl } from '@/shared/lib/getImageUrl';

interface Props {
    users: RecentUserDto[];
}

// Захищена функція форматування з обробкою порожніх значень
const formatDate = (dateString?: string): string => {
    if (!dateString || dateString.trim() === '' || dateString.startsWith('0001')) {
        return '—';
    }
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '—';

        return date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return '—';
    }
};

export const RecentUsersTable = ({ users }: Props) => {
    const ACCENT_COLOR = '#7AE0FF';
    const STROKE_COLOR = '#353E4B';

    return (
        <div
            className="rounded-3 overflow-hidden h-100"
            style={{
                backgroundColor: '#1e2330',
                border: `1px solid ${STROKE_COLOR}`,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
            }}
        >
            {/* Заголовок */}
            <div className="px-4 py-3 d-flex align-items-center justify-content-between">
                <h6 className="text-white fw-bold mb-0 d-flex align-items-center gap-2">
                    <i className="bi bi-person-plus text-cyan" style={{ color: ACCENT_COLOR }} />
                    New Users Registered
                </h6>
                <span className="badge px-2.5 py-1 rounded text-secondary bg-dark border border-secondary small">
                    Latest {users.length}
                </span>
            </div>

            {/* Шапка таблиці */}
            <div
                className="d-flex align-items-center px-4 py-2 border-bottom"
                style={{ backgroundColor: '#1a1f2e', borderColor: STROKE_COLOR }}
            >
                <span className="text-secondary small fw-semibold flex-shrink-0" style={{ width: '32px' }}>#</span>
                <span className="text-secondary small fw-semibold flex-grow-1">User Profile</span>
                <span className="text-secondary small fw-semibold d-none d-sm-block flex-shrink-0" style={{ width: '210px' }}>Email Address</span>
                <span className="text-secondary small fw-semibold text-end flex-shrink-0" style={{ width: '100px' }}>Joined Date</span>
            </div>

            {/* Тіло списку */}
            {users.length === 0 ? (
                <div className="text-secondary text-center py-5 small">
                    <i className="bi bi-person-x d-block fs-3 mb-2 text-muted" />
                    No recent users found.
                </div>
            ) : (
                users.map((u, i) => {
                    const avatarSrc = getImageUrl(u.avatarUrl);

                    return (
                        <div
                            key={u.id}
                            className="d-flex align-items-center px-4 py-3 border-bottom"
                            style={{
                                backgroundColor: i % 2 === 0 ? '#212631' : '#1e2330',
                                borderColor: 'rgba(255, 255, 255, 0.03)',
                            }}
                        >
                            {/* Індекс */}
                            <span className="text-secondary small flex-shrink-0" style={{ width: '32px' }}>{i + 1}</span>

                            {/* Профіль */}
                            <div className="d-flex align-items-center gap-3 flex-grow-1 min-w-0">
                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0"
                                    style={{
                                        width: '34px',
                                        height: '34px',
                                        background: avatarSrc ? 'transparent' : 'linear-gradient(135deg, #4B7490, #325B76)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)'
                                    }}
                                >
                                    {avatarSrc ? (
                                        <img
                                            src={avatarSrc}
                                            alt="avatar"
                                            className="w-100 h-100 object-fit-cover"
                                        />
                                    ) : (
                                        <span className="text-white-50 fw-bold small" style={{ fontSize: '0.85rem' }}>
                                            {u.firstName?.charAt(0)?.toUpperCase() || '?'}
                                        </span>
                                    )}
                                </div>
                                <span className="text-white small fw-semibold text-truncate">
                                    {u.firstName || '—'}
                                </span>
                            </div>

                            {/* Email */}
                            <span
                                className="text-secondary small text-truncate d-none d-sm-block flex-shrink-0"
                                style={{ width: '210px', color: '#a0aec0' }}
                            >
                                {u.email || '—'}
                            </span>

                            {/* Дата реєстрації */}
                            <span
                                className="text-white-50 small text-end text-nowrap flex-shrink-0"
                                style={{ width: '100px', fontSize: '0.8rem' }}
                            >
                                {formatDate(u.createdAt)}
                            </span>
                        </div>
                    );
                })
            )}
        </div>
    );
};