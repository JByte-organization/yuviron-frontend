import { TrackDto } from '@repo/api';

export const TRACK_COLUMNS_MAP: Partial<Record<keyof TrackDto, string>> = {
    title: 'Track',
    artistName: 'Artist', // Если на бэке поле называется по-другому, подправь
    genreName: 'Genre',
    duration: 'Duration',
    status: 'Status', // Например, Active / Hidden
    createdAt: 'Release Date',
    id: 'ID'
};

export const trackTableColumns = Object.values(TRACK_COLUMNS_MAP);