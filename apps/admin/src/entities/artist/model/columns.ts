import { ArtistListItemDto } from '@repo/api';

/**
 * Используем camelCase ключи строго по твоему DTO.
 * Добавляем 'actions' для колонки с кнопками.
 */
export const ARTIST_COLUMNS_MAP: Partial<Record<keyof ArtistListItemDto | 'actions', string>> = {
    name: 'Artist',
    ownerEmail: 'Owner',
    verificationStatus: 'Status',
    totalAlbums: 'Albums',
    createdAt: 'Joined',
    actions: 'Actions'
};

// Экспортируем массив строк для заголовков BaseTable
export const artistTableColumns = Object.values(ARTIST_COLUMNS_MAP) as string[];

// Экспортируем ключи для рендера строк
export const artistTableColumnKeys = Object.keys(ARTIST_COLUMNS_MAP) as Array<keyof ArtistListItemDto | 'actions'>;