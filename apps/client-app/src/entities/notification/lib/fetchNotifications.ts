import {
    customInstance,
    type NotificationCategory,
    type NotificationDtoPaginatedList,
} from '@repo/api/client.ts';

interface FetchParams {
    categories?: NotificationCategory[];
    page?: number;
    pageSize?: number;
}

export const fetchNotifications = (
    { categories, page = 1, pageSize = 50 }: FetchParams,
): Promise<NotificationDtoPaginatedList> => {
    const qs = new URLSearchParams();
    categories?.forEach((c) => qs.append('Categories', c));
    qs.append('Page', String(page));
    qs.append('PageSize', String(pageSize));

    return customInstance<NotificationDtoPaginatedList>(`/api/notifications?${qs.toString()}`, {
        method: 'GET',
    });
};
