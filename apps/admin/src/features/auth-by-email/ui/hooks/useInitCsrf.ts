import { useEffect } from 'react';
import axios from 'axios';
import { apiClient } from '@/shared/api/apiClient.ts';

export const useInitCsrf = (): void => {
    useEffect(() => {
        const ac = new AbortController();

        (async () => {
            try {
                await apiClient.get('/auth/csrf-token', { signal: ac.signal });
            } catch (err: unknown) {
                if (!axios.isCancel(err)) {
                    console.error('CSRF init failed', err);
                }
            }
        })();

        return () => ac.abort();
    }, []);
};