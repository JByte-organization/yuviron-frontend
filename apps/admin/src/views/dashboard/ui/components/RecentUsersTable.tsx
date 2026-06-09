import React from 'react';
import type { RecentUserDto } from '@repo/api/admin.ts';

interface Props {
    users: RecentUserDto[];
}

const formatDate = (dateString?: string): string => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU', {
        day: '2-digit', month: '2-digit', year: 'numeric',
    });
};

export const RecentUsersTable = ({ users }: Props) => (
    <div className="rounded-3 overflow-hidden h-100" style={{ backgroundColor: '#1e2330' }}>

        <div className="px-4 pt-4 pb-2">
            <h6 className="text-white fw-semibold mb-0">New Users Registered</h6>
        </div>

        {/* Header */}
        <div
            className="d-flex align-items-center px-4 py-2 border-bottom border-secondary"
            style={{ backgroundColor: '#1a1f2e' }}
        >
            <span className="text-secondary small" style={{ width: '32px' }}>#</span>
            <span className="text-secondary small flex-grow-1">Name</span>
            <span className="text-secondary small d-none d-sm-block" style={{ width: '210px' }}>Email</span>
            <span className="text-secondary small text-end" style={{ width: '90px' }}>Date</span>
        </div>

        {users.length === 0 ? (
            <div className="text-secondary text-center py-4 small">No recent users</div>
        ) : users.map((u, i) => (
            <div
                key={u.id}
                className="d-flex align-items-center px-4 py-3 border-bottom border-secondary"
                style={{ backgroundColor: i % 2 === 0 ? '#212631' : '#1e2330' }}
            >
                <span className="text-secondary small" style={{ width: '32px' }}>{i + 1}</span>

                {/* Avatar + Name */}
                <div className="d-flex align-items-center gap-2 flex-grow-1 min-w-0">
                    <div
                        className="rounded-circle bg-secondary d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0"
                        style={{ width: '32px', height: '32px' }}
                    >
                        {u.avatarUrl
                            ? <img
                                src={`https://api.yuviron.com/storage/${u.avatarUrl}`}
                                alt="avatar"
                                className="w-100 h-100 object-fit-cover"
                            />
                            : <span className="text-white-50 fw-bold small">
                                {u.firstName?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                        }
                    </div>
                    <span className="text-white small fw-semibold text-truncate">
                        {u.firstName || '—'}
                    </span>
                </div>

                {/* Email */}
                <span
                    className="text-secondary small text-truncate d-none d-sm-block"
                    style={{ width: '210px' }}
                >
                    {u.email || '—'}
                </span>

                {/* Date */}
                <span className="text-secondary small text-end text-nowrap" style={{ width: '90px' }}>
                    {formatDate(u.createdAt)}
                </span>
            </div>
        ))}
    </div>
);