import { TrackDetailsDto } from '@repo/api';

export const TRACK_COLUMNS_MAP: Partial<Record<keyof TrackDetailsDto, string>> = {
    title: 'Track',
    artists: 'Artist', // Если на бэке поле называется по-другому, подправь
    genres: 'Genre',
    durationMs: 'Duration',
    //status: 'Status', // Например, Active / Hidden
    createdAt: 'Release Date',
    id: 'ID'
};

export const trackTableColumns = Object.values(TRACK_COLUMNS_MAP);