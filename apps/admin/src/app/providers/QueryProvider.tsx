'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 60 * 1000,
                // Если ошибка 401 или 403, ретрить не нужно — сразу кидаем в лог/редирект
                retry: (failureCount, error: any) => {
                    const status = error?.response?.status || error?.status;
                    if (status === 401 || status === 403) return false;
                    return failureCount < 1;
                },
            },
        },
    }));

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};