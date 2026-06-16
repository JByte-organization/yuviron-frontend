import type { QueryClient } from '@tanstack/react-query';

export const invalidateNotifications = (qc: QueryClient): void => {
    qc.invalidateQueries({
        predicate: (q) =>
            typeof q.queryKey[0] === 'string' &&
            (q.queryKey[0] as string).includes('/api/notifications'),
    });
};
