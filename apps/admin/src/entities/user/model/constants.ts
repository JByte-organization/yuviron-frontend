// src/entities/user/model/constants.ts
import { UserDetailsDto } from '@repo/api/admin.ts';

/**
 * Ключ из API -> Название для заголовка таблицы.
 * Используем Partial<Record<keyof UserDto, string>>, чтобы TS
 * проверял существование ключей в модели UserDto.
 */
export const USER_COLUMNS_MAP: Partial<Record<keyof UserDetailsDto, string>> = {
    firstName: 'User',
    email: 'Email',
    roles: 'Role',
    accountState: 'Account State',
    createdAt: 'Registered',
    lastLoginAt: 'Last Login',
    id: 'ID'
};

export const tableColumns = Object.values(USER_COLUMNS_MAP) as string[];

// Экспортируем ключи, чтобы UserRow знал, в каком порядке рендерить ячейки
export const tableColumnKeys = Object.keys(USER_COLUMNS_MAP) as Array<keyof UserDetailsDto>;