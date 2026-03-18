// apps/admin/src/app/users/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { adminService, User } from '@repo/api';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        adminService.getAllUsers().then(setUsers);
    }, []);

    const handleBan = async (id: string) => {
        if (confirm('Забанить этого пользователя?')) {
            await adminService.banUser(id);
            // Обновляем список после бана
            setUsers(users.map(u => u.id === id ? { ...u, status: 'BANNED' } : u));
        }
    };

    return (
        <div className="p-4">
            <h1>Users Management</h1>
            {/* Твоя таблица, куда ты просто прокидываешь users */}
            {/* <UsersTable data={users} onBan={handleBan} /> */}
        </div>
    );
}