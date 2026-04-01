import { UserDetailsDto } from '@repo/api';

export const USER_COLUMNS_MAP: Partial<Record<keyof UserDetailsDto, string>> = {
    displayName: 'User',
    email: 'Email',
    roles: 'Status/Roles',
    accountState: 'Account State',
    createdAt: 'Registered',
    lastLoginAt: 'Last Login',
    id: 'ID'
};

// Исправление: Добавляем as string[], чтобы убрать undefined из типа
export const tableColumns = Object.values(USER_COLUMNS_MAP) as string[];

// Для ключей используем более строгую типизацию
export const tableColumnKeys = Object.keys(USER_COLUMNS_MAP) as Array<keyof UserDetailsDto>;