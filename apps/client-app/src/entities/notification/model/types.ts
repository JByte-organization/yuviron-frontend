import { NotificationCategory, type NotificationDto } from '@repo/api/client.ts';

export type { NotificationDto };

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

export type NotificationGroup = 'today' | 'thisWeek' | 'thisMonth' | 'earlier';

export const GROUP_LABELS: Record<NotificationGroup, string> = {
    today: 'Сьогодні',
    thisWeek: 'Цього тижня',
    thisMonth: 'Цього місяця',
    earlier: 'Раніше',
};

export const GROUP_ORDER: NotificationGroup[] = ['today', 'thisWeek', 'thisMonth', 'earlier'];
