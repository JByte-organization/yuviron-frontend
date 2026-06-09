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
    return (
        <div className="recent-users h-100">
            {/* Заголовок */}
            <div className="px-4 py-3 d-flex align-items-center justify-content-between">
                <h6 className="text-white fw-bold mb-0 d-flex align-items-center gap-2">
                    <i className="bi bi-person-plus recent-users__title-icon" />
                    New Users Registered
                </h6>
                <span className="badge px-2.5 py-1 rounded text-secondary bg-dark border border-secondary small">
                    Latest {users.length}
                </span>
            </div>

            {/* Шапка таблиці */}
            <div className="d-flex align-items-center px-4 py-2 recent-users__th">
                <span className="small fw-semibold flex-shrink-0 recent-users__col-idx">#</span>
                <span className="small fw-semibold flex-grow-1">User Profile</span>
                <span className="small fw-semibold d-none d-sm-block flex-shrink-0 recent-users__col-email">Email Address</span>
                <span className="small fw-semibold text-end flex-shrink-0 recent-users__col-date">Joined Date</span>
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
                        <div key={u.id ?? i} className="d-flex align-items-center px-4 py-3 recent-users__row">
                            {/* Індекс */}
                            <span className="small flex-shrink-0 recent-users__col-idx recent-users__index">{i + 1}</span>

                            {/* Профіль */}
                            <div className="d-flex align-items-center gap-3 flex-grow-1 min-w-0">
                                <div
                                    className={`rounded-circle d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0 recent-users__avatar ${
                                        !avatarSrc ? 'recent-users__avatar--empty' : ''
                                    }`}
                                >
                                    {avatarSrc ? (
                                        <img
                                            src={avatarSrc}
                                            alt="avatar"
                                            className="w-100 h-100 object-fit-cover"
                                        />
                                    ) : (
                                        <span className="fw-bold small">
                                            {u.firstName?.charAt(0)?.toUpperCase() || '?'}
                                        </span>
                                    )}
                                </div>
                                <span className="text-white small fw-semibold text-truncate">
                                    {u.firstName || '—'}
                                </span>
                            </div>

                            {/* Email */}
                            <span className="small text-truncate d-none d-sm-block flex-shrink-0 recent-users__col-email recent-users__email">
                                {u.email || '—'}
                            </span>

                            {/* Дата реєстрації */}
                            <span className="small text-end text-nowrap flex-shrink-0 recent-users__col-date recent-users__date">
                                {formatDate(u.createdAt)}
                            </span>
                        </div>
                    );
                })
            )}
        </div>
    );
};