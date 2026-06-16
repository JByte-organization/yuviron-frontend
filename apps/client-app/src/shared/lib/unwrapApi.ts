
export const unwrap = <T,>(raw: unknown): T | undefined => {
    if (!raw) return undefined;
    const obj = raw as { data?: T };
    return (obj.data ?? (raw as T)) as T;
};

export const unwrapItems = <T,>(raw: unknown): T[] => {
    if (!raw) return [];
    const obj = raw as { items?: T[]; data?: { items?: T[] } };
    return obj.items ?? obj.data?.items ?? [];
};

export const unwrapList = <T,>(raw: unknown): T[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw as T[];
    const obj = raw as { data?: T[] };
    return Array.isArray(obj.data) ? obj.data : [];
};

export const extractFileId = (res: unknown): string | null => {
    const r = res as { fileId?: string; data?: { fileId?: string } } | null;
    return r?.data?.fileId ?? r?.fileId ?? null;
};

export const extractFileUrl = (res: unknown): string | null => {
    const r = res as { url?: string | null; data?: { url?: string | null } } | null;
    return r?.data?.url ?? r?.url ?? null;
};
