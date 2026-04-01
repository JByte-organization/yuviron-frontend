import { ArtistDetailsDto } from '@repo/api';

export const ARTIST_COLUMNS_MAP: Partial<Record<keyof ArtistDetailsDto, string>> = {
    name: 'Artist',
    description: 'Description',
    isVerified: 'Verified',
    createdAt: 'Joined',
    id: 'ID'
};

export const artistTableColumns = Object.values(ARTIST_COLUMNS_MAP);