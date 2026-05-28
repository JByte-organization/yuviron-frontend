import React from 'react';
import { AccountState, type UserListItemDto } from '@repo/api';
import Image from 'next/image'
import {getImageUrl} from "@/shared/lib/getImageUrl";

interface Props {
    user: UserListItemDto;
    onEdit: (user: UserListItemDto) => void;
    onDelete: (user: UserListItemDto) => void;
    isSelected: boolean;
    onSelect: () => void;
}

const formatDate = (dateString?: string | null): string => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const RoleBadge = ({ roles }: { roles?: string[] | null }) => {
    const list = roles ?? [];
    if (list.includes('Admin')) return <span className="badge bg-danger">ADMIN</span>;
    if (list.includes('ManagementUser')) return <span className="badge bg-info text-dark">MANAGER</span>;
    return <span className="badge bg-secondary">USER</span>;
};

const StateBadge = ({ state }: { state?: AccountState | string | number }) => {
    // Приводим всё к строке для надёжного сравнения
    const s = String(state);

    // Проверяем и строковое значение, и числовой ID из контракта [cite: 808, 809]
    const isActive = s === 'Active' || s === '1';
    const isBanned = s === 'Banned' || s === '3';
    const isDeleted = s === 'Deleted' || s === '4';

    // Маппинг стилей
    const styles = (() => {
        if (isActive) return { dot: 'bg-success', text: 'text-success', label: 'Active' };
        if (isBanned) return { dot: 'bg-danger', text: 'text-danger', label: 'Banned' };
        if (isDeleted) return { dot: 'bg-warning', text: 'text-warning', label: 'Deleted' };
        return { dot: 'bg-secondary', text: 'text-secondary', label: state ?? 'Unknown' };
    })();

    return (
        <div className="d-flex align-items-center gap-2">
            <span
                className={`rounded-circle ${styles.dot}`}
                style={{ width: '8px', height: '8px', flexShrink: 0 }}
            />
            <span className={`${styles.text} small`}>{styles.label}</span>
        </div>
    );
};

export const UserRow = ({ user, onEdit, onDelete, isSelected, onSelect }: Props) => {

    // Путь к аватару
    const avatarSrc = getImageUrl(user.avatarUrl);

    return (
        <tr className="border-bottom border-secondary align-middle" style={{backgroundColor: '#3B4452'}}>

            {/* Checkbox */}
            <td className="px-4">
                <input
                    type="checkbox"
                    className="form-check-input bg-dark border-secondary"
                    checked={isSelected}
                    onChange={onSelect}
                />
            </td>

            {/* Avatar + Name */}
            <td className="py-3">
                <div className="d-flex align-items-center gap-3">
                    <div
                        className="rounded-circle bg-secondary d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0"
                        style={{width: '36px', height: '36px'}}
                    >
                        {avatarSrc
                            ? <img src={avatarSrc} alt="avatar" className="w-100 h-100 object-fit-cover"/>
                            : <span className="text-white-50 small fw-bold">
                                {user.firstName?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                        }
                    </div>
                    <span className="text-white fw-semibold text-nowrap">
                        {user.firstName || '—'}
                    </span>
                </div>
            </td>

            {/* Email */}
            <td className="text-secondary small">{user.email}</td>

            {/* Role */}
            <td><RoleBadge roles={user.roles}/></td>

            {/* State */}
            <td><StateBadge state={user.accountState}/></td>

            {/* Created At */}
            <td className="text-secondary small text-nowrap">{formatDate(user.createdAt)}</td>

            {/* Last Login */}
            <td className="text-secondary small text-nowrap">{formatDate(user.lastLoginAt)}</td>

            {/* ID (truncated) */}
            <td className="text-secondary small font-monospace" title={user.id}>
                {user.id ? `${user.id.slice(0, 8)}…` : '—'}
            </td>

            {/* Actions */}
            <td className="px-4">
                <div className="d-flex justify-content-end gap-1">
                    <button
                        className="btn btn-sm btn-secondary border-0 shadow-none px-2"
                        title="Edit"
                        onClick={() => onEdit(user)}
                    >
                        <Image
                            src="/images/icons/edit-btn.svg"
                            width={16}
                            height={16}
                            alt="edit icon"
                        />
                    </button>
                    <button
                        className="btn btn-sm btn-secondary border-0 shadow-none px-2"
                        title="Delete"
                        onClick={() => onDelete(user)}
                    >
                        <Image
                            src="/images/icons/delete-btn.svg"
                            width={16}
                            height={16}
                            alt="delete icon"
                        />
                    </button>
                </div>
            </td>
        </tr>
    );
};
