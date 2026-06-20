export { extractFileId } from '@/shared/lib/unwrapApi';

interface ApiErrorBody {
    errors?: Record<string, string[]>;
    detail?: string;
    title?: string;
    message?: string;
    error?: string;
}

export const extractApiError = (err: unknown, fallback: string): string => {
    const data = (err as { response?: { data?: ApiErrorBody | string } })?.response?.data;
    if (typeof data === 'string') return data || fallback;
    const fieldErrors = data?.errors ? Object.values(data.errors).flat().join(' ') : null;
    return (
        fieldErrors ||
        data?.detail ||
        data?.title ||
        data?.message ||
        data?.error ||
        fallback
    );
};
