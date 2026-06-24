
/** Об'єкт-відповідь: `raw.data` або сам `raw`. */
export const unwrap = <T,>(raw: unknown): T | undefined => {
    if (!raw) return undefined;
    const obj = raw as { data?: T };
    return (obj.data ?? (raw as T)) as T;
};

/** Пагінований список: items лежать у `raw.items` або `raw.data.items`. */
export const unwrapItems = <T,>(raw: unknown): T[] => {
    if (!raw) return [];
    const obj = raw as { items?: T[]; data?: { items?: T[] } };
    return obj.items ?? obj.data?.items ?? [];
};

/** Плоский список: сам `raw` — масив, або `raw.data` — масив. */
export const unwrapList = <T,>(raw: unknown): T[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw as T[];
    const obj = raw as { data?: T[] };
    return Array.isArray(obj.data) ? obj.data : [];
};

/** Витягує fileId з відповіді upload (`{ fileId }` або `{ data: { fileId } }`). */
export const extractFileId = (res: unknown): string | null => {
    const r = res as { fileId?: string; data?: { fileId?: string } } | null;
    return r?.data?.fileId ?? r?.fileId ?? null;
};

/**
 * Витягує тимчасовий `url` з відповіді upload (`{ url }` або `{ data: { url } }`).
 * Бек віддає його одразу після завантаження — показуємо картинку до того, як файл
 * доїде на медіа-сервер (інакше getImageUrl по хешу повертає 404 / биту картинку).
 */
export const extractFileUrl = (res: unknown): string | null => {
    const r = res as { url?: string | null; data?: { url?: string | null } } | null;
    return r?.data?.url ?? r?.url ?? null;
};
