// src/entities/user/model/columns.ts
import { UserDto } from '@repo/api';

/**
 * Описываем маппинг: Ключ из API -> Название для заголовка таблицы.
 * Используем Partial<Record<keyof UserDto, string>>, чтобы TS
 * проверял существование ключей в модели UserDto.
 */
export const USER_COLUMNS_MAP: Partial<Record<keyof UserDto, string>> = {
    displayName: 'User',
    email: 'Email',
    roles: 'Status/Roles',
    accountState: 'Account State',
    createdAt: 'Registered',
    lastLoginAt: 'Last Login',
    id: 'ID'
};

// Экспортируем готовый массив заголовков для пропса columns в BaseTable
export const tableColumns = Object.values(USER_COLUMNS_MAP);

// Экспортируем ключи, чтобы UserRow знал, в каком порядке рендерить ячейки
export const tableColumnKeys = Object.keys(USER_COLUMNS_MAP) as Array<keyof UserDto>;