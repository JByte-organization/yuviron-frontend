import { NotificationCategory, type NotificationDto } from '@repo/api/client.ts';

// Реальный контракт уведомления = сгенерированный NotificationDto:
// { id, category, type, title, body, entityType, entityId, isRead, createdAt }.
export type { NotificationDto };

// ─── Вкладки UI → массив категорий для GetApiNotificationsParams.Categories ───
// «Все» = без фильтра; «Музика» = [Music]; «Інше» = [System, Social, Billing].
export type NotificationTab = 'all' | 'music' | 'other';

export const NOTIFICATION_TABS: {
    key: NotificationTab;
    label: string;
    categories?: NotificationCategory[];
}[] = [
    { key: 'all', label: 'Всі' },
    { key: 'music', label: 'Музика', categories: [NotificationCategory.Music] },
    {
        key: 'other',
        label: 'Інше',
        categories: [
            NotificationCategory.System,
            NotificationCategory.Social,
            NotificationCategory.Billing,
        ],
    },
];

// ─── Группировка по времени ───────────────────────────────────────────────
// Бэк отдаёт плоский массив в UTC — группируем на клиенте (см. groupNotifications),
// чтобы браузер корректно перевёл время в часовой пояс пользователя.
export type NotificationGroup = 'today' | 'thisWeek' | 'thisMonth' | 'earlier';

export const GROUP_LABELS: Record<NotificationGroup, string> = {
    today: 'Сьогодні',
    thisWeek: 'Цього тижня',
    thisMonth: 'Цього місяця',
    earlier: 'Раніше',
};

export const GROUP_ORDER: NotificationGroup[] = ['today', 'thisWeek', 'thisMonth', 'earlier'];
