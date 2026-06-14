import type { BannerRequestListItemDto } from '@repo/api/admin.ts';

export const BANNER_REQUEST_COLUMNS_MAP: Partial<Record<keyof BannerRequestListItemDto, string>> = {
    bannerUrl:  'Preview',
    artistName: 'Artist',
    albumTitle: 'Album',
    title:      'Title',
    status:     'Status',
    createdAt:  'Created',
};

export const bannerRequestTableColumns = Object.values(BANNER_REQUEST_COLUMNS_MAP) as string[];
