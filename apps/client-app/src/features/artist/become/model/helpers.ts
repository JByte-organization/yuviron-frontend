// Достаёт fileId из ответа /api/files/upload. Сгенерированный клиент оборачивает
// тело как { data }, но кастомный mutator отдаёт уже распарсенное тело — читаем оба.
export const extractFileId = (res: unknown): string | null => {
    const r = res as { fileId?: string; data?: { fileId?: string } } | null;
    return r?.data?.fileId ?? r?.fileId ?? null;
};

interface ApiErrorBody {
    errors?: Record<string, string[]>;
    detail?: string;
    title?: string;
    message?: string;
    error?: string;
}

// Единый разбор ошибки API (тот же приоритет, что в register/login-формах).
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
