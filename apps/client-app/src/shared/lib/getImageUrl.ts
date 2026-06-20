/**
 * Формує URL зображення з медіа-домену.
 *
 * Медіа-сервер адресує файли за ГОЛИМ хешем у корені. Бекенд повертає шлях
 * у форматі "папка/хеш" ("avatars/d4c4256b...", "artists/banners/7c1d1ae2...")
 * або просто хеш — беремо тільки останній сегмент (хеш) і склеюємо з базовим
 * URL. Зовнішні абсолютні URL (каталожні імпорти) віддаємо як є.
 *
 * @example
 * getImageUrl("artists/banners/7c1d1ae2e3e646fb8ddb4dade665dadb")
 * // → "https://dev-i.yuviron.com/7c1d1ae2e3e646fb8ddb4dade665dadb"
 *
 * getImageUrl("2e5747900bb1478eb59f5278a88cec2f")
 * // → "https://dev-i.yuviron.com/2e5747900bb1478eb59f5278a88cec2f"
 *
 * getImageUrl("https://i.scdn.co/image/abc") // → "https://i.scdn.co/image/abc"
 * getImageUrl(null) // → null
 */

const IMAGE_BASE_URL = 'https://dev-i.yuviron.com';

export const getImageUrl = (path?: string | null): string | null => {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    const hash = path.split('/').pop();
    if (!hash) return null;
    return `${IMAGE_BASE_URL}/${hash}`;
};