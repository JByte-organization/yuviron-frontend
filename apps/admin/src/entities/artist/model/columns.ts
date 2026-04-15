import {ArtistListItemDto, type VerificationStatus} from '@repo/api';

export const ARTIST_COLUMNS_MAP: Partial<Record<keyof ArtistListItemDto, string>> = {
    avatarUrl: 'Avatar',
    name: 'Artist Name',
    id: 'ID',
    ownerEmail: 'Owner',
    verificationStatus: 'Status',
    totalAlbums: 'Albums',
    createdAt: 'Created',
};

// Экспортируем массив строк для заголовков BaseTable
export const artistTableColumns = Object.values(ARTIST_COLUMNS_MAP) as string[];

// Экспортируем ключи для рендера строк
export const artistTableColumnKeys = Object.keys(ARTIST_COLUMNS_MAP) as Array<keyof ArtistListItemDto | 'actions'>;