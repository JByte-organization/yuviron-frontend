import type { QueryClient } from '@tanstack/react-query';

// Сбрасывает кэш списка уведомлений и счётчика непрочитанных одним предикатом
// (оба ключа начинаются с `/api/notifications`). Зовём после read / read-all
// и при получении пуша по SignalR, чтобы UI и колокольчик обновились.
export const invalidateNotifications = (qc: QueryClient): void => {
    qc.invalidateQueries({
        predicate: (q) =>
            typeof q.queryKey[0] === 'string' &&
            (q.queryKey[0] as string).includes('/api/notifications'),
    });
};
