import { isThisMonth, isThisWeek, isToday } from 'date-fns';
import type { NotificationDto, NotificationGroup } from '../model/types';

// Группировка плоского массива по датам на стороне клиента.
// createdAt приходит в UTC (ISO 8601) — new Date() переводит в локаль браузера,
// поэтому «Сьогодні / Цього тижня» считаются в часовом поясе пользователя.
// Неделя начинается с понедельника (weekStartsOn: 1).
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
