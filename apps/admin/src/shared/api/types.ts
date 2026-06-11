// Можно положить в src/shared/api/types.ts
export interface PaginatedList<T> {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface TrackListItemDto {
    id: string;
    title: string;
    artistNames: string[];
    albumTitle: string;
    durationMs: number;
    playCount: number;
    coverUrl?: string;
}