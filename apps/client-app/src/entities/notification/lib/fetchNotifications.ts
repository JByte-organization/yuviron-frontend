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

// Сгенерированный URL-билдер сериализует массив через запятую
// (Categories=System,Social,Billing), а бэк (ASP.NET) ждёт ПОВТОРЯЮЩИЕСЯ ключи
// (Categories=System&Categories=Social&Categories=Billing) — ТЗ п.4. Поэтому
// для списка строим query сами через URLSearchParams.append и зовём общий
// customInstance (с авторизацией/refresh/CSRF, как у всех запросов).
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
