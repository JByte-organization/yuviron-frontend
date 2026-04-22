'use client';

import React, { useState } from 'react';
import { useGetApiAdminUsers, type UserListItemDto } from '@repo/api';
import { BaseTable } from '@/shared/ui/Table/BaseTable';
import { UserRow } from '@/entities/user/ui/UserRow';
import { CreateUserModal } from '@/features/user/create/ui/CreateUserModal';
import { EditUserModal } from '@/features/user/edit/ui/EditUserModal';     // добавить
import { DeleteUserModal } from '@/features/user/delete/ui/DeleteUserModal'; // добавить

import { tableColumns } from '@/entities/user/model/constants';

export const UsersPage = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserListItemDto | null>(null);
    const [deletingUser, setDeletingUser] = useState<UserListItemDto | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const { data, isLoading, isError, refetch } = useGetApiAdminUsers();
    const response = data as any;
    const users: UserListItemDto[] = response?.items || response?.data?.items || [];

    const handleToggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    return (
        <>
            <BaseTable
                title="Users"
                subtitle="Manage system users and access levels"
                onNewClick={() => setIsCreateModalOpen(true)}
                searchPlaceholder="Search by ID, product, or others..."
                columns={tableColumns}
                pagination={
                    <nav>
                        <ul className="pagination pagination-sm mb-0">
                            <li className="page-item">
                                <a className="page-link bg-dark border-secondary text-white" href="#">«</a>
                            </li>
                            <li className="page-item active">
                                <a className="page-link bg-primary border-primary text-dark fw-bold" href="#">1</a>
                            </li>
                            <li className="page-item">
                                <a className="page-link bg-dark border-secondary text-white" href="#">»</a>
                            </li>
                        </ul>
                    </nav>
                }
            >
                {isLoading ? (
                    <tr>
                        <td colSpan={9} className="text-center py-5">
                            <div className="spinner-border text-primary" role="status" />
                            <div className="text-secondary mt-2">Fetching users...</div>
                        </td>
                    </tr>
                ) : isError ? (
                    <tr>
                        <td colSpan={9} className="text-center py-5 text-danger">
                            Error loading users. Check your API connection.
                        </td>
                    </tr>
                ) : users.length === 0 ? (
                    <tr>
                        <td colSpan={9} className="text-center py-5 text-secondary">
                            No users found in the database.
                        </td>
                    </tr>
                ) : (
                    users.map((user) => (
                        <UserRow
                            key={user.id}
                            user={user}
                            onEdit={setEditingUser}       // ← передаём
                            onDelete={setDeletingUser}    // ← передаём
                            isSelected={selectedIds.has(user.id!)}
                            onSelect={() => handleToggleSelect(user.id!)}
                        />
                    ))
                )}
            </BaseTable>

            <CreateUserModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={refetch}
            />

            {/* Модалка редактирования */}
            <EditUserModal
                user={editingUser}
                isOpen={!!editingUser}
                onClose={() => setEditingUser(null)}
                onSuccess={() => { refetch(); setEditingUser(null); }}
            />

            {/* Модалка удаления */}
            <DeleteUserModal
                user={deletingUser}
                isOpen={!!deletingUser}
                onClose={() => setDeletingUser(null)}
                onSuccess={() => { refetch(); setDeletingUser(null); }}
            />
        </>
    );
};