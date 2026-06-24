import { isThisMonth, isThisWeek, isToday } from 'date-fns';
import type { NotificationDto, NotificationGroup } from '../model/types';

export const groupNotifications = (
    items: NotificationDto[],
): Record<NotificationGroup, NotificationDto[]> => {
    const acc: Record<NotificationGroup, NotificationDto[]> = {
        today: [],
        thisWeek: [],
        thisMonth: [],
        earlier: [],
    };

    for (const n of items) {
        const date = new Date(n.createdAt ?? '');
        const key: NotificationGroup = isToday(date)
            ? 'today'
            : isThisWeek(date, { weekStartsOn: 1 })
                ? 'thisWeek'
                : isThisMonth(date)
                    ? 'thisMonth'
                    : 'earlier';
        acc[key].push(n);
    }

    return acc;
};
