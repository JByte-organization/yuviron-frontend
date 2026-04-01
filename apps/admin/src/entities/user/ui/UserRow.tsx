import React from 'react';
import { UserDetailsDto } from '@repo/api';
import { RoleSimpleDto } from '@repo/api';
import { AccountState } from '@repo/api';

interface UserRowProps {
    user: UserDetailsDto;
}

export const UserRow = ({ user }: UserRowProps) => {
    // Хелпер для дат
    const formatDate = (dateString?: string | null) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Бейдж ролей
    // const renderRoles = () => {
    //     //roles теперь массив объектов RoleSimpleDto [cite: 881]
    //     const roles: RoleSimpleDto[] = user.roles || [];
    //
    //     // Извлекаем только имена для удобства проверки [cite: 697]
    //     const roleNames = roles.map(r => r.name);
    //
    //     if (roleNames.includes('Admin')) {
    //         return <span className="badge bg-danger">ADMIN</span>;
    //     }
    //     if (roleNames.includes('ManagementUser')) {
    //         return <span className="badge bg-info text-dark">MANAGER</span>;
    //     }
    //
    //     return <span className="badge bg-secondary text-white-50">USER</span>;
    // };

    const renderRoles = () => {
        const roles = user.roles || [];

        const hasRole = (roleName: string) => {
            return roles.some(role => {
                if (typeof role === 'string') return role === roleName;
                return role?.name === roleName;
            });
        };

        if (hasRole('Admin')) {
            return <span className="badge bg-danger">ADMIN</span>;
        }

        if (hasRole('ManagementUser')) {
            return <span className="badge bg-info text-dark">MANAGER</span>;
        }

        return <span className="badge bg-secondary text-white-50">USER</span>;
    };

    // Состояние аккаунта (Active / Blocked)
    const renderAccountState = () => {
        const isActive = user.accountState === AccountState.Active;
        const isBanned = user.accountState === AccountState.Banned;
        const isDeleted = user.accountState === AccountState.Deleted;

        let statusText: string = user.accountState || 'Unknown';

        // Логика выбора цвета (Bootstrap классы)
        let dotClass = 'bg-secondary';
        let textClass = 'text-secondary';

        if (isActive) {
            dotClass = 'bg-success';
            textClass = 'text-success';
        } else if (isBanned || isDeleted) {
            dotClass = 'bg-danger';
            textClass = 'text-danger';
        } else if (user.accountState === 'Suspended' as any) {
            // Suspended
            dotClass = 'bg-warning';
            textClass = 'text-warning';
            statusText = 'Suspended';
        }

        return (
            <div className="d-flex align-items-center gap-2">
            <span
                className={`rounded-circle ${dotClass}`}
                style={{ width: '8px', height: '8px' }}
            ></span>
                <span className={`small ${textClass}`}>
                {statusText}
            </span>
            </div>
        );
    };

    return (
        <tr className="border-bottom border-secondary align-middle" style={{ backgroundColor: '#212631' }}>
            <td className="px-4">
                <input type="checkbox" className="form-check-input bg-dark border-secondary shadow-none" />
            </td>

            {/* Юзер: Аватар + Имя */}
            <td className="py-3">
                <div className="d-flex align-items-center gap-3">
                    <div
                        className="rounded-circle bg-secondary d-flex align-items-center justify-content-center overflow-hidden"
                        style={{ width: '35px', height: '35px', flexShrink: 0 }}
                    >
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="avatar" className="w-100 h-100 object-fit-cover" />
                        ) : (
                            <span className="text-white-50 small">{user.displayName?.charAt(0)}</span>
                        )}
                    </div>
                    <div className="text-white fw-bold text-nowrap">
                        {user.displayName || 'No Name'}
                    </div>
                </div>
            </td>

            {/* Email */}
            <td className="text-secondary small">
                {user.email}
            </td>

            {/* Роли */}
            <td>
                {renderRoles()}
            </td>

            {/* Состояние (Active/Blocked) */}
            <td className="small">
                {renderAccountState()}
            </td>

            {/* Дата регистрации */}
            <td className="text-secondary small text-nowrap">
                {formatDate(user.createdAt)}
            </td>

            {/* Последний вход */}
            <td className="text-secondary small text-nowrap">
                {formatDate(user.lastLoginAt)}
            </td>

            {/* ID */}
            <td className="text-secondary small font-monospace" title={user.id || ''}>
                {user.id ? `${user.id.slice(0, 8)}...` : 'N/A'}
            </td>

            {/* Действия */}
            <td className="text-end px-4">
                <div className="d-flex justify-content-end gap-2">
                    <button className="btn btn-sm btn-outline-info border-0 shadow-none" title="Edit">✏️</button>
                    <button className="btn btn-sm btn-outline-danger border-0 shadow-none" title="Delete">❌</button>
                </div>
            </td>
        </tr>
    );
};