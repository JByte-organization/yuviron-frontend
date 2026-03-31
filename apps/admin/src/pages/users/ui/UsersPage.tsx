'use client';

import React, { useState } from 'react';
import { useGetApiAdminUsers } from '@repo/api';
import { BaseTable } from '@/shared/ui/Table/BaseTable';
import { UserRow } from '@/entities/user/ui/UserRow';
import { CreateUserModal } from '@/features/user/create/ui/CreateUserModal';

import { tableColumns, tableColumnKeys } from '@/entities/user/model/constants';

export const UsersPage = () => {
    // Модальное окно
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, isLoading, isError, refetch } = useGetApiAdminUsers();
    const response = data as any;

    const users = response?.items || response?.data?.items || [];

    // Проверки
    // console.log('Итоговый массив users:', users);
    // console.log('Данные из API:', response?.data);
    // console.log('Список юзеров (items):', users);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <BaseTable
                title="Users"
                subtitle="Manage system users and access levels"
                onNewClick={handleOpenModal}
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
                        <td colSpan={6} className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                            <div className="text-secondary mt-2">Fetching users...</div>
                        </td>
                    </tr>
                ) : isError ? (
                    <tr>
                        <td colSpan={6} className="text-center py-5 text-danger">
                            Error loading users. Check your API connection.
                        </td>
                    </tr>
                ) : users.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="text-center py-5 text-secondary">
                            No users found in the database.
                        </td>
                    </tr>
                ) : (
                    users.map((user: any) => (
                        <UserRow key={user.id} user={user} />
                    ))
                )}
            </BaseTable>

            {/* Внедряем модалку создания пользователя */}
            <CreateUserModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSuccess={() => {
                    refetch();
                }}
            />
        </>
    );
};